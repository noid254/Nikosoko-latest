# Tukosoko POS — PWA kit for Ultimate POS

Turns `pos.tukosoko.com` into an installable app with a Roberts-style look (cream / mustard / ink, Cormorant Garamond + Outfit), a mobile bottom nav, and Bluetooth receipt printing.
It's an **overlay**: nothing in Ultimate POS's PHP is edited except two Blade includes, so upgrades stay easy.

## 1. Copy files (on the server)
Let `$POS` be the Laravel app folder (the one containing `artisan`).

```bash
cp -r pos-pwa-kit/public/pwa            $POS/public/pwa
cp    pos-pwa-kit/public/sw.js          $POS/public/sw.js
cp    pos-pwa-kit/public/offline.html   $POS/public/offline.html
cp    pos-pwa-kit/public/manifest.webmanifest $POS/public/manifest.webmanifest
```
`sw.js` **must** sit in `public/` root so it controls the whole site.

## 2. Add the includes (2 edits)
Keep these in a file that survives updates (back it up; Ultimate POS updates can overwrite views).

**`resources/views/layouts/partials/css.blade.php`** — append:
```html
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#C9A227">
<link rel="stylesheet" href="/pwa/tukosoko-theme.css?v=1">
```
**`resources/views/layouts/partials/javascripts.blade.php`** — append (after the other scripts):
```html
<script src="/pwa/bt-print.js?v=1"></script>
<script src="/pwa/tukosoko-pwa.js?v=1"></script>
```
Do the same two snippets in the login layout (`resources/views/layouts/auth.blade.php`, or `auth2`/`guest` depending on your version) so the login screen is branded too.

Then: `php artisan view:clear`. Bump `?v=1` whenever you change the files.

## 3. Web-server notes
- Must be HTTPS (it is). Serve `.webmanifest` as `application/manifest+json` (nginx: add to `mime.types`; works regardless in Chrome).
- Don't cache `sw.js` for long: `Cache-Control: no-cache` on `/sw.js`.

## 4. Using it
**Install:** open the site in Chrome on Android → "Install Tukosoko POS" banner (or ⋮ → Install app). iPhone: Share → Add to Home Screen (printing over Bluetooth is not possible on iOS).

**Print over Bluetooth:**
1. Switch the printer on. Tap the round 🖨 button (bottom-right) → choose the printer → it turns gold with a green dot.
2. Finalise a sale as usual — the receipt now prints to the printer automatically. If Bluetooth fails it falls back to the normal print dialog.
3. Tap 🖨 while a receipt is on screen to reprint; tap it with nothing on screen to test or disconnect.

Paper width: console `TukosokoPrinter.setWidth(48)` for 80mm (default 32 = 58mm). Turn auto-print off: `TukosokoPrinter.setAuto(false)`.

**Requirements/limits:** BLE printers only (most cheap 58mm/80mm portable ones are), Chrome/Edge on Android or desktop. Classic-Bluetooth printers: pair in Android settings and use the normal print dialog (Android's print service). Receipt logos aren't printed (text only).

## 5. Test checklist
- [ ] Lighthouse → PWA "installable" passes
- [ ] Sidebar, tables, buttons and POS screen look on-brand at phone width
- [ ] Pair printer, sell an item, receipt prints, totals line up
- [ ] Airplane mode → page shows the "You're offline" screen (sales still need connectivity)

## Not included (ask if you want these)
Offline sale queue, a fully custom mobile POS screen built on Ultimate POS's Connector API (needs that module + Passport), and a logo image on receipts.
