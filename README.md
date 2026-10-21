# Vietnam Deal Calc (PWA)

Keep all files together: index.html, sw.js, manifest.webmanifest, 4 icons.

## Put it online (GitHub Pages)
1. New public repo, e.g. `vn-deal-calc`. Upload all files to the root.
2. Settings → Pages → Deploy from a branch → `main`, `/ (root)` → Save.
3. After a minute, open https://<username>.github.io/vn-deal-calc/ in Chrome on your phone.

## Install
Chrome → ⋮ → Install app (or the Install chip in the top bar).
Open it once online so it caches itself and the font, then test in airplane mode.

## Using it
- Deal: type the asking price on the keypad. Tap "Final price" to type the agreed price, or tap an offer tile if the seller accepts it. Hold ⌫ to clear. Log → tap a category.
- Cash: log every exchange (dollars handed over, dong received). Prices then convert at your real average rate.
- Count my wallet: enter what you actually have; any gap can be logged as unlogged spending.
- Settings (gear): dollars brought, optional NPR target, trip dates, rates, backup.

## Updating
Edit files, bump `CACHE = 'vdc-v6'` in sw.js, then reopen the app twice. Your data is untouched.

## Data
Stored only on the phone (localStorage for the github.io site). Uninstalling or clearing Chrome site data deletes it. Save a backup every day or two.

## Price advice without an API key
The same app is also published inside Claude: https://claude.ai/artifact/9QYn1kZcDn5FWXV1HBNkFf
There, "Check price" uses your own Claude account (no key). In the installed app, "Price advice" opens that page with your prices filled in. Records in the two copies are separate; log purchases in the installed app.
