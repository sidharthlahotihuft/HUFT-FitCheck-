# Photo → build

`build-from-photo.js` is a Vercel serverless function. The customer uploads a photo
in step 3 of Check a fit; the browser shrinks it, posts it here, and this calls
Claude's vision API and returns `lean`, `average`, `broad` or `unclear`.

The API key lives here, on the server. It must never go into `index.html` — that
file is downloaded by every customer.

## Switch it on

1. Get an API key from https://platform.claude.com
2. Vercel → your project → Settings → Environment Variables → add
   `ANTHROPIC_API_KEY`. Add it to Production, Preview and Development.
3. Redeploy. Nothing in `index.html` needs changing — it already points at
   `/api/build-from-photo`.

Optional: `BUILD_MODEL` to pin a different model. Default is `claude-sonnet-5`.
Current model IDs: https://platform.claude.com/docs/en/about-claude/models/overview

## Check it works

```bash
curl -s -X POST https://YOUR-SITE.vercel.app/api/build-from-photo \
  -H 'content-type: application/json' \
  -d "{\"image\":\"$(base64 -i dog.jpg | tr -d '\n')\",\"mediaType\":\"image/jpeg\",\"breed\":\"Beagle\"}"
```

Expect `{"build":"average","confidence":0.8,"note":"..."}`.
`{"error":"ANTHROPIC_API_KEY is not set"}` means step 2 did not take.

## What it deliberately will not do

- **It will not guess.** Below 0.55 confidence, or on a photo it cannot read, it
  returns `unclear` and the customer is asked instead. A guessed build ships a
  wrong size, which is the thing this whole tool exists to reduce.
- **It will not comment on the dog's weight or health.** The note is read by the
  owner. It describes build for sizing, nothing else.

## Known limits

Single-photo build judgement is genuinely hard. A long coat reads as bulk — which
is correct for sizing, and the prompt says so, but it means a fluffy lean dog gets
called broad. Head-on photos, sitting dogs and cropped shots mostly come back
`unclear`. The three manual buttons stay on screen for exactly this reason; treat
the photo as a shortcut, not as the answer.

## Cost

One API call per photo. Photos are capped at 1200px on the long edge before upload,
which keeps each call small. Watch the spend if this goes on a live product page.
