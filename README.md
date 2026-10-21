# Vietnam Deal Calc (PWA) — version 14

Files: index.html, sw.js, manifest.webmanifest, 4 icons. Upload all of them to the repo root (replace the old ones).

## Updating your installed app
1. Upload these files to the GitHub repo, replacing the old ones, and commit.
2. Wait 1–2 minutes for Pages to publish.
3. Open the installed app online, close it fully, open it again. Version 3 shows a Group tab.
Your records stay: same site, same storage, and old records are converted automatically.

## Tabs
- Deal: keypad (tap digits to move the cursor), offer tiles, Show seller (big number + Vietnamese phrases, keeps the screen on), Price advice, Log.
- Spent: money left, today vs daily allowance, a bar per trip day, category filter, tap any purchase to edit or delete.
- Cash: dollars left, dong in wallet, exchanges, Count my wallet, banknote guide.
- Group: people on the trip, who owes whom, record cash paybacks.

## Data
Stored only on the phone. Save a backup every day or two (Settings, or the reminder on the Spent tab).
After changing any file, bump `CACHE` in sw.js so phones pick up the update.

## Price advice without an API key
https://claude.ai/artifact/9QYn1kZcDn5FWXV1HBNkFf — uses your Claude account. In the installed app, Price advice opens it with your prices filled in.
