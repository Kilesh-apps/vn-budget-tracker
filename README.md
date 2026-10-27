# Deal Calc — how it works

An offline trip-money app for the Vietnam trip: converter, bargaining tools, personal spending, cash wallet, group bills and settle-up. It's a static web app (PWA) hosted on GitHub Pages. There is **no server or database**; everything lives on the phone, with an optional backup to your own Google Sheet.

## Files

| File | What it does |
|---|---|
| `index.html` | The whole app: screens, styles and logic in one file. Saves data in the browser's `localStorage`. |
| `sw.js` | Service worker. Caches the app files so it opens offline. **Bump `CACHE` (e.g. `vdc-v35` → `vdc-v36`) on every update**, or phones keep the old version. |
| `manifest.webmanifest` | Makes the site installable as an app (name, icons, colours). |
| `icon-*.png` | App icons (normal + maskable, 192/512 px). |
| `report.html` | The page friends open from a shared link. Reads the data from the link itself (snapshot) or from your Google Sheet (live). |
| `Code.gs` | Google Apps Script that lives inside your Google Sheet (not on GitHub). Receives backups and serves the live group link. |
| `README.md` | This note. |

## Where data is stored (on the phone)

| Key | Contents |
|---|---|
| `vdc.v1` | Everything: purchases, exchanges, payments/loans, wallet corrections, people, packing list, phrases, settings. |
| `vdc.sync` | Google Sheets link, recovery code, live-link token. |
| `vdc.notes` | Banknote photos (kept separate; not backed up). |

Old data is migrated automatically on load. If saved data ever can't be read, an untouched copy is kept as `vdc.v1.rescue-…`.

## Main ideas in the code

- **Money is stored in dong (₫).** Rupee/dollar bills keep their original amount plus the rate used when logged, so later rate changes don't alter old bills.
- **Wallet** = dong from exchanges − cash you paid + paybacks received − paybacks given ± corrections. Card payments don't touch it.
- **Splits:** equal splits are rounded to real notes (1k/2k/5k/10k); whoever paid absorbs the leftover. Custom and multi-payer splits are stored as exact amounts.
- **Balances:** each person's net = what they paid − their shares ± money given/received. Totals across everyone always sum to zero.
- **Settle up:** always the *fewest payments* worked out from those nets. Who-pays-whom can change; a person's total only changes when a bill or payment involves them. "What changed, and why?" replays history to show this.

## Online services (all optional; the app works offline)

- **Exchange rate:** open.er-api.com (fallback: currency-api on jsDelivr), cached for offline.
- **Translation of custom phrases:** MyMemory (free), or Claude if an API key / the Claude copy is used.
- **Voice:** the phone's own Vietnamese text-to-speech.
- **Price advice:** Claude, via the Claude-hosted copy (no key) or your own Anthropic API key.
- **Sharing:** WhatsApp links (`wa.me`); the report page.

## Sharing with the group

- **Snapshot link** (`report.html#z.…`): data compressed inside the link; nothing uploaded. Long, and frozen at the moment shared.
- **Live link** (`report.html#live.…`): short; the page fetches the latest group summary from your sheet. Needs Google Sheets backup with script version 2.
- **Text message:** formatted WhatsApp text.
- Only shared bills and money between people are ever shared, never personal purchases.

## Google Sheets backup (`Code.gs`)

- The app posts readable tabs (Purchases, Group bills, Payments, Exchanges, Balances), plus a hidden full backup and a hidden group summary.
- The first phone to connect locks the sheet with a secret. The **recovery code** in Settings is needed to restore on a new phone.
- After changing `Code.gs`: Deploy → Manage deployments → ✏️ → **New version** → Deploy (the link stays the same).

## Updating the app

1. Edit `index.html` / `report.html`.
2. Bump `CACHE` in `sw.js`.
3. Upload the changed files to `Kilesh-apps/vn-budget-tracker` and commit.
4. Check the Actions tab shows a green ✓ (if no run appears, make a tiny README edit).
5. Reopen the installed app twice to pick up the new version.
