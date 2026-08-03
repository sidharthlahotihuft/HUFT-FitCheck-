/* Reads a dog photo and returns lean / average / broad.
 *
 * Runs as a Vercel serverless function so the API key never reaches the browser.
 * The client posts JSON: { image: "<base64, no data: prefix>", mediaType: "image/jpeg", breed: "Beagle" }
 * and gets back { build, confidence, note } or { error }.
 *
 * Set ANTHROPIC_API_KEY in Vercel: Settings -> Environment Variables.
 * Optional: BUILD_MODEL (defaults below).
 */

const MODEL = process.env.BUILD_MODEL || "claude-sonnet-5";
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/* Structured output. Forcing a tool call means we never have to parse prose,
   and "unclear" is a first-class answer rather than something we infer from a
   failure to match. A wrong build ships a wrong size, so unclear must be cheap
   for the model to say. */
const TOOL = {
  name: "report_build",
  description: "Report the dog's body build from the photo.",
  input_schema: {
    type: "object",
    properties: {
      build: {
        type: "string",
        enum: ["lean", "average", "broad", "unclear"],
        description:
          "lean = ribs visible or easily felt, clear waist tuck. average = typical for the breed. " +
          "broad = deep or barrel chest, heavy set, or a thick coat that adds real girth. " +
          "unclear = the photo does not show enough to judge."
      },
      confidence: { type: "number", description: "0 to 1." },
      note: {
        type: "string",
        description:
          "One short sentence a customer would read, in plain language. No jargon, no body-condition scores, " +
          "no comment on the dog's health or weight."
      }
    },
    required: ["build", "confidence", "note"]
  }
};

const PROMPT = (breed) => `You are sizing a dog for pet clothing and walking gear.

Look at the photo and judge the dog's BUILD${breed ? ` (the owner says it is a ${breed})` : ""}. This decides whether they take the recommended size or the size up. It is about girth and frame, not about weight or health.

Judge carefully:
- A long or fluffy coat adds girth for sizing purposes. If the coat is thick, that counts toward "broad" even if the dog underneath is slim.
- A photo taken head-on, from above, or with the dog sitting or lying down usually cannot show build. Say "unclear".
- A cropped photo, a very dark photo, more than one dog, or no dog at all: say "unclear".
- Do not guess. "unclear" is a good answer and costs us nothing. A wrong answer sends the customer the wrong size.

Never comment on whether the dog is overweight, underweight or unwell. The note is read by the owner.

Call report_build with your answer.`;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set" });

  const { image, mediaType, breed } = req.body || {};
  if (!image) return res.status(400).json({ error: "no image" });
  if (!OK_TYPES.includes(mediaType))
    return res.status(400).json({ error: "unsupported image type" });
  // base64 is ~4/3 of the byte size; Anthropic caps an image at 5MB
  if (image.length > 6_800_000) return res.status(413).json({ error: "image too large" });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        tools: [TOOL],
        tool_choice: { type: "tool", name: "report_build" },
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
              { type: "text", text: PROMPT(breed) }
            ]
          }
        ]
      })
    });

    if (!r.ok) {
      const body = await r.text();
      console.error("anthropic error", r.status, body.slice(0, 500));
      return res.status(502).json({ error: "upstream" });
    }

    const j = await r.json();
    const call = (j.content || []).find((c) => c.type === "tool_use");
    if (!call) return res.status(502).json({ error: "no answer" });

    const { build, confidence, note } = call.input || {};
    // Low confidence is treated as unclear. Better to ask the customer than to
    // ship a size off the back of a shrug.
    if (build === "unclear" || !(confidence >= 0.55))
      return res.status(200).json({ build: "unclear", confidence, note: "" });

    return res.status(200).json({ build, confidence, note });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "upstream" });
  }
};
