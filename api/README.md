# Photo → breed and build

`build-from-photo.js` is a Vercel serverless function. The customer uploads a photo
at step 1 of Check a fit; the browser shrinks it, posts it here with the list of
breeds we hold data for, and this asks a vision model for two things:

- **breed** — constrained to the list we sent, or `null` if it will not commit
- **build** — `lean`, `average`, `broad`, or `null`
- **photoIssue** + **retryHint** — what was wrong with the photo, if anything, and
  one plain-language sentence telling the owner what to take instead

Either answer can come back `null` independently. The screen then asks the customer
only for the part it could not read, and — when there is a `photoIssue` — names the
problem and offers an "Upload another photo" button. `photoIssue` is set even when
the read succeeded, if a better photo would have raised confidence.

`photoIssue` is one of: `not-side-on`, `sitting-or-lying`, `cropped`, `too-far`,
`too-close`, `dark-or-blurry`, `obscured`, `multiple-dogs`, `no-dog`. Anything else
is discarded. The customer-facing wording for each lives in `ISSUE_TEXT` in
`index.html` — the model supplies only the hint sentence, not the diagnosis text,
so the tone stays consistent.

The API key lives here, on the server. It must never go into `index.html` — that
file is downloaded by every customer.

## Switch it on — OpenAI

1. Get a key from https://platform.openai.com/api-keys (starts `sk-...`)
2. Vercel → your project → Settings → Environment Variables → add
   `OPENAI_API_KEY`. Tick Production, Preview and Development.
3. Redeploy.

Nothing in `index.html` changes — it already points at `/api/build-from-photo`.

Optional: `OPENAI_MODEL` to pin a different model. Default `gpt-5.6`.
Model list: https://developers.openai.com/api/docs/models/compare
A smaller model (e.g. a mini variant) costs less and is likely fine for this —
worth testing against a dozen of your own photos before committing either way.

## Or Anthropic

Same steps with `ANTHROPIC_API_KEY` from https://platform.claude.com, and optional
`ANTHROPIC_MODEL` (default `claude-sonnet-5`).

**If both keys are set, OpenAI is used.** To switch back to Anthropic, remove
`OPENAI_API_KEY` from the Vercel environment.

## Check it works

```bash
curl -s -X POST https://YOUR-SITE.vercel.app/api/build-from-photo \
  -H 'content-type: application/json' \
  -d "{\"image\":\"$(base64 -i dog.jpg | tr -d '\n')\",\"mediaType\":\"image/jpeg\",\"breeds\":[\"Beagle\",\"Pug\",\"Labrador Retriever\"]}"
```

Expect `{"breed":"Beagle","breedConfidence":0.9,"build":"average","buildConfidence":0.8,"note":"..."}`.

| You get | It means |
|---|---|
| `{"error":"no API key set …"}` | the environment variable did not take — check you redeployed |
| `{"error":"upstream"}` | bad key, no credit, rate limit, or a model name that does not exist. The real reason is in the Vercel function logs |
| `{"breed":null}` or `{"build":null}` | working correctly — the model would not commit, so we ask the customer |

## What it deliberately will not do

- **It will not guess.** Below 0.55 confidence, or on a photo it cannot read, the
  field comes back `null` and the customer is asked instead. A wrong breed and a
  wrong build both ship a wrong size, which is the thing this tool exists to reduce.
- **It will not invent a breed.** The answer is checked against the list the client
  sent; anything outside it is discarded.
- **It will not comment on the dog's weight or health.** The note is read by the
  owner. It describes build for sizing, nothing else.

## Known limits

**Breed from a photo is the weaker of the two.** Most dogs in India are mixed breed,
and a mix has no right answer — the prompt tells the model to pick the listed breed
closest in body size and shape and to lower its confidence, which is the useful
behaviour for sizing but will not always match what the owner calls their dog.
Expect Indie and Indian Spitz to absorb a lot of the uncertainty.

Build is hard too. A long coat reads as bulk — correct for sizing, and the prompt
says so, but a fluffy lean dog gets called broad. Head-on photos, sitting dogs and
cropped shots mostly come back null.

The breed chips and build cards stay on screen underneath for exactly this reason.
Treat the photo as a shortcut, not as the answer.

## Cost

One API call per photo. Photos are capped at 1200px on the long edge before upload,
which keeps each call small. Watch the spend if this goes on a live product page.
