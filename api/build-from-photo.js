/* Reads a dog photo and returns lean / average / broad.
 *
 * Runs as a Vercel serverless function so the API key never reaches the browser.
 * The client posts JSON: { image: "<base64, no data: prefix>", mediaType: "image/jpeg", breed: "Beagle" }
 * and gets back { build, confidence, note } or { error }.
 *
 * Works with EITHER provider — whichever key you set wins:
 *   OPENAI_API_KEY      -> OpenAI      (optional OPENAI_MODEL,   default below)
 *   ANTHROPIC_API_KEY   -> Anthropic   (optional ANTHROPIC_MODEL, default below)
 * If both are set, OPENAI_API_KEY is used. Set them in Vercel:
 *   Settings -> Environment Variables.
 */

const OPENAI_MODEL    = process.env.OPENAI_MODEL    || "gpt-5.6";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MIN_CONFIDENCE = 0.55;

const BUILD_DESC =
  "lean = ribs visible or easily felt, clear waist tuck. " +
  "average = typical for the breed. " +
  "broad = deep or barrel chest, heavy set, or a thick coat that adds real girth. " +
  "unclear = the photo does not show enough to judge.";
const NOTE_DESC =
  "One short sentence a customer would read, in plain language. No jargon, no body-condition " +
  "scores, no comment on the dog's health or weight.";

const PROMPT = (breed) => `You are sizing a dog for pet clothing and walking gear.

Look at the photo and judge the dog's BUILD${breed ? ` (the owner says it is a ${breed})` : ""}. This decides whether they take the recommended size or the size up. It is about girth and frame, not about weight or health.

Judge carefully:
- A long or fluffy coat adds girth for sizing purposes. If the coat is thick, that counts toward "broad" even if the dog underneath is slim.
- A photo taken head-on, from above, or with the dog sitting or lying down usually cannot show build. Answer "unclear".
- A cropped photo, a very dark photo, more than one dog, or no dog at all: answer "unclear".
- Do not guess. "unclear" is a good answer and costs us nothing. A wrong answer sends the customer the wrong size.

Never comment on whether the dog is overweight, underweight or unwell. The note is read by the owner.`;

/* ---------------- OpenAI ---------------- */
async function askOpenAI(key, image, mediaType, breed) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_completion_tokens: 300,
      // strict json_schema means we never parse prose, and "unclear" is a
      // first-class answer rather than something inferred from a failure to match
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "dog_build",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["build", "confidence", "note"],
            properties: {
              build: { type: "string", enum: ["lean", "average", "broad", "unclear"], description: BUILD_DESC },
              confidence: { type: "number", description: "0 to 1." },
              note: { type: "string", description: NOTE_DESC }
            }
          }
        }
      },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT(breed) },
            { type: "image_url", image_url: { url: `data:${mediaType};base64,${image}` } }
          ]
        }
      ]
    })
  });
  if (!r.ok) {
    console.error("openai error", r.status, (await r.text()).slice(0, 500));
    return null;
  }
  const j = await r.json();
  const txt = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  if (!txt) return null;
  try { return JSON.parse(txt); } catch { return null; }
}

/* ---------------- Anthropic ---------------- */
async function askAnthropic(key, image, mediaType, breed) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 300,
      tools: [
        {
          name: "report_build",
          description: "Report the dog's body build from the photo.",
          input_schema: {
            type: "object",
            required: ["build", "confidence", "note"],
            properties: {
              build: { type: "string", enum: ["lean", "average", "broad", "unclear"], description: BUILD_DESC },
              confidence: { type: "number", description: "0 to 1." },
              note: { type: "string", description: NOTE_DESC }
            }
          }
        }
      ],
      tool_choice: { type: "tool", name: "report_build" },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
            { type: "text", text: PROMPT(breed) + "\n\nCall report_build with your answer." }
          ]
        }
      ]
    })
  });
  if (!r.ok) {
    console.error("anthropic error", r.status, (await r.text()).slice(0, 500));
    return null;
  }
  const j = await r.json();
  const call = (j.content || []).find((c) => c.type === "tool_use");
  return call ? call.input : null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!openaiKey && !anthropicKey)
    return res.status(500).json({ error: "no API key set — add OPENAI_API_KEY or ANTHROPIC_API_KEY" });

  const { image, mediaType, breed } = req.body || {};
  if (!image) return res.status(400).json({ error: "no image" });
  if (!OK_TYPES.includes(mediaType)) return res.status(400).json({ error: "unsupported image type" });
  if (image.length > 6_800_000) return res.status(413).json({ error: "image too large" });

  try {
    const out = openaiKey
      ? await askOpenAI(openaiKey, image, mediaType, breed)
      : await askAnthropic(anthropicKey, image, mediaType, breed);

    if (!out) return res.status(502).json({ error: "upstream" });

    const { build, confidence, note } = out;
    // Low confidence is treated as unclear. Better to ask the customer than to
    // ship a size off the back of a shrug.
    if (build === "unclear" || !(confidence >= MIN_CONFIDENCE))
      return res.status(200).json({ build: "unclear", confidence, note: "" });

    return res.status(200).json({ build, confidence, note });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "upstream" });
  }
};
