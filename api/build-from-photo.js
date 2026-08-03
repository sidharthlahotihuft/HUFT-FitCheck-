/* Reads a dog photo and returns the breed and the build.
 *
 * Runs as a Vercel serverless function so the API key never reaches the browser.
 * Client posts JSON:
 *   { image: "<base64, no data: prefix>", mediaType: "image/jpeg", breeds: ["Beagle", ...] }
 * and gets back:
 *   { breed, breedConfidence, build, buildConfidence, note }
 * where breed is one of the breeds passed in, or "unclear", and build is
 * lean | average | broad | unclear.
 *
 * Works with EITHER provider — whichever key you set wins:
 *   OPENAI_API_KEY      -> OpenAI      (optional OPENAI_MODEL,    default below)
 *   ANTHROPIC_API_KEY   -> Anthropic   (optional ANTHROPIC_MODEL, default below)
 * If both are set, OPENAI_API_KEY is used. Set them in Vercel:
 *   Settings -> Environment Variables.
 */

const OPENAI_MODEL    = process.env.OPENAI_MODEL    || "gpt-5.6";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MIN_BUILD_CONF = 0.55;
const MIN_BREED_CONF = 0.55;
const MAX_BREEDS = 200;

const BUILD_DESC =
  "lean = ribs visible or easily felt, clear waist tuck. " +
  "average = typical for the breed. " +
  "broad = deep or barrel chest, heavy set, or a thick coat that adds real girth. " +
  "unclear = the photo does not show enough to judge.";
const NOTE_DESC =
  "One short friendly sentence the dog's owner will read, in plain language. Mention the breed and " +
  "the build. No jargon, no body-condition scores, no comment on the dog's health or weight.";

const PROMPT = (breeds) => `You are sizing a dog for pet clothing and walking gear, for an Indian pet shop.

From the photo, work out two things.

1. BREED — pick the closest match from this list and nothing else:
${breeds.join(", ")}

Most dogs in India are mixed breed. If the dog is clearly a mix, or you are not confident, pick the listed breed it most resembles IN BODY SIZE AND SHAPE, and lower your breedConfidence. If you cannot tell at all, answer "unclear". A street-type or mixed dog of medium build is usually closest to "Indian Pariah (Indie)" if that is in the list.

2. BUILD — how heavy-set the dog is. This decides whether they take the recommended size or the size up. It is about girth and frame, not weight or health.
- A long or fluffy coat adds girth for sizing purposes. A thick coat counts toward "broad" even if the dog underneath is slim.
- A photo taken head-on, from above, or with the dog sitting or lying down usually cannot show build. Answer "unclear" for build.
- A cropped photo, a very dark photo, more than one dog, or no dog at all: answer "unclear" for both.

Do not guess. "unclear" is a good answer and costs us nothing — we simply ask the owner instead. A wrong answer sends them the wrong size.

Never comment on whether the dog is overweight, underweight or unwell. The note is read by the owner.`;

const schemaProps = (breeds) => ({
  breed: { type: "string", enum: [...breeds, "unclear"], description: "Closest match from the list, or unclear." },
  breedConfidence: { type: "number", description: "0 to 1." },
  build: { type: "string", enum: ["lean", "average", "broad", "unclear"], description: BUILD_DESC },
  buildConfidence: { type: "number", description: "0 to 1." },
  note: { type: "string", description: NOTE_DESC }
});
const REQUIRED = ["breed", "breedConfidence", "build", "buildConfidence", "note"];

/* ---------------- OpenAI ---------------- */
async function askOpenAI(key, image, mediaType, breeds) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_completion_tokens: 400,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "dog_breed_and_build",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: REQUIRED,
            properties: schemaProps(breeds)
          }
        }
      },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT(breeds) },
            { type: "image_url", image_url: { url: `data:${mediaType};base64,${image}` } }
          ]
        }
      ]
    })
  });
  if (!r.ok) { console.error("openai error", r.status, (await r.text()).slice(0, 500)); return null; }
  const j = await r.json();
  const txt = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  if (!txt) return null;
  try { return JSON.parse(txt); } catch { return null; }
}

/* ---------------- Anthropic ---------------- */
async function askAnthropic(key, image, mediaType, breeds) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 400,
      tools: [{
        name: "report_dog",
        description: "Report the dog's breed and build from the photo.",
        input_schema: { type: "object", required: REQUIRED, properties: schemaProps(breeds) }
      }],
      tool_choice: { type: "tool", name: "report_dog" },
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
          { type: "text", text: PROMPT(breeds) + "\n\nCall report_dog with your answer." }
        ]
      }]
    })
  });
  if (!r.ok) { console.error("anthropic error", r.status, (await r.text()).slice(0, 500)); return null; }
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

  const { image, mediaType, breeds } = req.body || {};
  if (!image) return res.status(400).json({ error: "no image" });
  if (!OK_TYPES.includes(mediaType)) return res.status(400).json({ error: "unsupported image type" });
  if (image.length > 6_800_000) return res.status(413).json({ error: "image too large" });
  if (!Array.isArray(breeds) || breeds.length === 0)
    return res.status(400).json({ error: "no breed list" });
  const list = breeds.filter((b) => typeof b === "string" && b.length < 60).slice(0, MAX_BREEDS);
  if (!list.length) return res.status(400).json({ error: "no breed list" });

  try {
    const out = openaiKey
      ? await askOpenAI(openaiKey, image, mediaType, list)
      : await askAnthropic(anthropicKey, image, mediaType, list);
    if (!out) return res.status(502).json({ error: "upstream" });

    // Anything we are not sure about comes back as unclear, and the customer is
    // asked instead. Never pass a shrug off as an answer — a wrong breed or a
    // wrong build both ship a wrong size.
    const breedOK = list.includes(out.breed) && out.breedConfidence >= MIN_BREED_CONF;
    const buildOK = ["lean", "average", "broad"].includes(out.build) && out.buildConfidence >= MIN_BUILD_CONF;

    return res.status(200).json({
      breed: breedOK ? out.breed : null,
      breedConfidence: out.breedConfidence,
      build: buildOK ? out.build : null,
      buildConfidence: out.buildConfidence,
      note: breedOK || buildOK ? out.note || "" : ""
    });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "upstream" });
  }
};
