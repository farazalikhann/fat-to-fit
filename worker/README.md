# Sprout AI proxy

A small Cloudflare Worker that holds the real OpenRouter API key server-side
and forwards meal-analysis requests to it. This exists because the Sprout
app itself is a static site (GitHub Pages) with no server of its own - without
this Worker, an OpenRouter key used directly from the browser would be
visible to any visitor via dev tools. The Worker is the only place the key
ever lives.

## One-time setup

1. **Create a free Cloudflare account** at https://dash.cloudflare.com/sign-up
   (no credit card required for Workers' free tier).

2. **Get an OpenRouter API key**: sign up at https://openrouter.ai, then
   create a key at https://openrouter.ai/keys. Do **not** add any paid
   credits - this project only ever calls free (`:free`) models, so a $0
   balance is all that's needed and caps any possible cost at zero even if
   the key ever leaked.

3. **Install dependencies** (from this `worker/` folder):
   ```
   npm install
   ```

4. **Log in to Cloudflare** (opens a browser once):
   ```
   npx wrangler login
   ```

5. **Set the secret** (you'll be prompted to paste your OpenRouter key - it
   is encrypted at rest by Cloudflare and never appears in any file or git
   history):
   ```
   npx wrangler secret put OPENROUTER_API_KEY
   ```

6. **Deploy**:
   ```
   npx wrangler deploy
   ```
   This prints a URL like `https://sprout-ai-proxy.<your-subdomain>.workers.dev`.

7. **Point the app at it**: set that URL as `VITE_AI_PROXY_URL` -
   - Locally: add `VITE_AI_PROXY_URL=<that URL>` to the `.env` file in the
     project root (not this folder).
   - On GitHub Pages: add a repository secret named `VITE_AI_PROXY_URL` with
     that URL at Settings → Secrets and variables → Actions. The deploy
     workflow already reads it (see `.github/workflows/deploy.yml`).

## If your GitHub Pages domain changes

`ALLOWED_ORIGINS` in `src/index.js` restricts which sites may call this
Worker (so a stranger can't ride on your free-tier quota from their own
site). If you fork this project or move to a custom domain, add that origin
to the list and redeploy.

## Local development

```
npm run dev
```
Starts the Worker at `http://127.0.0.1:8787` using a local `.dev.vars` file
for `OPENROUTER_API_KEY` (create one with that single line - it's
gitignored, never commit a real key to it).

## Updating the model list

`MODEL_CHAIN` in `src/index.js` is tried in order: the OpenRouter free
router first (it auto-selects an appropriate free model, including
vision-capable ones for photos), then two concrete free models as a
fallback in case the router or a specific model is ever rate-limited or
retired. Check https://openrouter.ai/collections/free-models if analysis
ever starts failing consistently - free model availability changes over
time, same as it did with Gemini's free tier before this migration.
