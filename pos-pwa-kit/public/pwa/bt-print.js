/* Tukosoko POS — Bluetooth ESC/POS receipt printing via Web Bluetooth.
 *
 * Works with BLE thermal printers (58mm / 80mm) in Chrome or Edge on Android, Windows, macOS, ChromeOS.
 * Not supported on iOS (Safari has no Web Bluetooth) and not for classic-Bluetooth-only printers —
 * those must be paired in Android settings and printed through the system dialog (the fallback below).
 *
 * Public API: window.TukosokoPrinter.{ connect, disconnect, isConnected, printElement, printText, setWidth }
 */
(function () {
  'use strict';

  // Service UUIDs commonly exposed by cheap Chinese BLE thermal printers (Xprinter, MTP, PT-210, GOOJPRT, MHT…).
  var SERVICES = [
    '000018f0-0000-1000-8000-00805f9b34fb',
    '0000ff00-0000-1000-8000-00805f9b34fb',
    '0000fee7-0000-1000-8000-00805f9b34fb',
    'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
    '49535343-fe7d-4ae5-8fa9-9fafd205e455',
    '0000ffe0-0000-1000-8000-00805f9b34fb',
    '0000ae30-0000-1000-8000-00805f9b34fb'
  ];
  var LS = { id: 'tk.printer.id', name: 'tk.printer.name', width: 'tk.printer.cols', auto: 'tk.printer.auto' };
  var CHUNK = 100;            // bytes per BLE write (safe under the typical 185/512 MTU)
  var CHUNK_DELAY = 25;       // ms between writes so cheap printers don't overflow their buffer

  var device = null, characteristic = null, listeners = [];
  var ESC = 0x1b, GS = 0x1d, LF = 0x0a;

  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function emit() { listeners.forEach(function (f) { try { f(api.isConnected(), get(LS.name, '')); } catch (e) {} }); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function supported() { return !!(navigator.bluetooth && navigator.bluetooth.requestDevice); }

  async function openGatt(dev) {
    dev.removeEventListener('gattserverdisconnected', onDisconnect);
    dev.addEventListener('gattserverdisconnected', onDisconnect);
    var server = await dev.gatt.connect();
    var services = await server.getPrimaryServices();
    for (var i = 0; i < services.length; i++) {
      var chars = await services[i].getCharacteristics();
      for (var j = 0; j < chars.length; j++) {
        if (chars[j].properties.write || chars[j].properties.writeWithoutResponse) {
          device = dev; characteristic = chars[j];
          set(LS.id, dev.id); set(LS.name, dev.name || 'Printer');
          emit();
          return true;
        }
      }
    }
    throw new Error('No writable characteristic found on this device');
  }

  function onDisconnect() { characteristic = null; emit(); }

  /** Show the browser's Bluetooth chooser and connect. Must be called from a user gesture. */
  async function connect() {
    if (!supported()) throw new Error('Bluetooth printing needs Chrome or Edge (not iPhone/Safari).');
    var dev;
    try {
      dev = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: SERVICES });
    } catch (e) { if (e.name === 'NotFoundError') return false; throw e; }
    await openGatt(dev);
    return true;
  }

  /** Silently reconnect to the previously paired printer (no chooser) when the browser allows it. */
  async function reconnect() {
    if (characteristic && device && device.gatt.connected) return true;
    if (device) { try { await openGatt(device); return true; } catch (e) {} }
    if (!supported() || !navigator.bluetooth.getDevices) return false;
    try {
      var saved = get(LS.id, '');
      var list = await navigator.bluetooth.getDevices();
      var d = list.filter(function (x) { return x.id === saved; })[0];
      if (!d) return false;
      await openGatt(d);
      return true;
    } catch (e) { return false; }
  }

  function disconnect() {
    if (device && device.gatt.connected) device.gatt.disconnect();
    characteristic = null; emit();
  }

  async function send(bytes) {
    if (!characteristic || !device.gatt.connected) {
      if (!(await reconnect())) { if (!(await connect())) throw new Error('No printer selected'); }
    }
    var useNoResp = characteristic.properties.writeWithoutResponse;
    for (var i = 0; i < bytes.length; i += CHUNK) {
      var part = bytes.slice(i, i + CHUNK);
      if (useNoResp) await characteristic.writeValueWithoutResponse(part);
      else await characteristic.writeValue(part);
      await sleep(CHUNK_DELAY);
    }
  }

  // ---------- ESC/POS encoding ----------
  function cols() { return parseInt(get(LS.width, '32'), 10) || 32; } // 32 = 58mm, 48 = 80mm

  function ascii(s) {
    // Printers default to a single-byte codepage; map common punctuation and drop the rest.
    return String(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...')
      .replace(/[^\x20-\x7e]/g, '');
  }
  function pad(l, r, w) { // left text, right text, total width
    l = ascii(l); r = ascii(r);
    var gap = w - l.length - r.length;
    if (gap < 1) { l = l.slice(0, Math.max(0, w - r.length - 1)); gap = Math.max(1, w - l.length - r.length); }
    return l + new Array(gap + 1).join(' ') + r;
  }
  function center(s, w) { s = ascii(s); if (s.length >= w) return s; var p = Math.floor((w - s.length) / 2); return new Array(p + 1).join(' ') + s; }
  function wrap(s, w) {
    s = ascii(s).replace(/\s+/g, ' ').trim(); var out = [];
    while (s.length > w) { var cut = s.lastIndexOf(' ', w); if (cut < 1) cut = w; out.push(s.slice(0, cut)); s = s.slice(cut).trim(); }
    if (s) out.push(s); return out;
  }
  function txt(s) { var a = []; for (var i = 0; i < s.length; i++) a.push(s.charCodeAt(i) & 0xff); return a; }

  /** Turn the rendered receipt DOM into plain monospaced lines (keeps table rows on one line). */
  function elementToLines(el) {
    var w = cols(), lines = [];
    function align(node) {
      var st = (node.getAttribute && (node.getAttribute('style') || '')) || '';
      var cls = (node.className && node.className.toString()) || '';
      if (/text-align:\s*center/i.test(st) || /text-center|centered/.test(cls)) return 'c';
      if (/text-align:\s*right/i.test(st) || /text-right/.test(cls)) return 'r';
      return 'l';
    }
    function push(text, a) {
      wrap(text, w).forEach(function (l) { lines.push(a === 'c' ? center(l, w) : a === 'r' ? new Array(Math.max(0, w - l.length) + 1).join(' ') + l : l); });
    }
    function walk(node, inherited) {
      if (node.nodeType === 3) return;
      var tag = node.tagName;
      if (!tag || /^(SCRIPT|STYLE|IMG|BUTTON|SVG)$/i.test(tag)) return;
      if (node.hidden || (node.style && node.style.display === 'none') || /hidden-print|no-print|hide/.test(node.className || '')) return;
      var a = align(node); if (a === 'l') a = inherited;
      if (tag === 'HR') { lines.push(new Array(w + 1).join('-')); return; }
      if (tag === 'TR') {
        var cells = [].slice.call(node.children).map(function (c) { return c.textContent.replace(/\s+/g, ' ').trim(); }).filter(function (c) { return c !== ''; });
        if (!cells.length) return;
        if (cells.length === 1) push(cells[0], a);
        else if (cells.length === 2) lines.push(pad(cells[0], cells[1], w));
        else { // item row: name on its own line, then "qty x price ......... total"
          var name = cells[0], total = cells[cells.length - 1], mid = cells.slice(1, -1).join(' x ');
          wrap(name, w).forEach(function (l) { lines.push(l); });
          lines.push(pad('  ' + mid, total, w));
        }
        return;
      }
      var hasBlockKids = [].some.call(node.children, function (c) { return /^(DIV|P|TABLE|TR|HR|H\d|UL|OL|SECTION|TBODY|THEAD|TFOOT)$/i.test(c.tagName); });
      if (!hasBlockKids) {
        var t = node.innerText ? node.innerText : node.textContent;
        t.split('\n').forEach(function (line) { if (line.trim()) push(line, a); });
        return;
      }
      [].forEach.call(node.childNodes, function (c) { if (c.nodeType === 1) walk(c, a); else if (c.nodeType === 3 && c.textContent.trim()) push(c.textContent, a); });
    }
    walk(el, 'l');
    return lines;
  }

  function buildJob(lines, opts) {
    opts = opts || {};
    var out = [ESC, 0x40];                       // init
    out.push(ESC, 0x74, 0);                      // codepage PC437
    lines.forEach(function (l) { out.push.apply(out, txt(l)); out.push(LF); });
    out.push(LF, LF, LF);
    if (opts.cut !== false) out.push(GS, 0x56, 0x42, 0x00); // feed + partial cut (ignored by printers w/o cutter)
    return new Uint8Array(out);
  }

  async function printText(text, opts) { await send(buildJob(String(text).split('\n').map(ascii), opts)); }

  async function printElement(el, opts) {
    if (typeof el === 'string') el = document.getElementById(el) || document.querySelector(el);
    if (!el) throw new Error('Receipt not found');
    var lines = elementToLines(el);
    if (!lines.length) throw new Error('Receipt is empty');
    await send(buildJob(lines, opts));
  }

  var api = {
    supported: supported, connect: connect, reconnect: reconnect, disconnect: disconnect,
    isConnected: function () { return !!(characteristic && device && device.gatt.connected); },
    name: function () { return get(LS.name, ''); },
    printElement: printElement, printText: printText,
    setWidth: function (c) { set(LS.width, String(c)); }, getWidth: cols,
    setAuto: function (v) { set(LS.auto, v ? '1' : '0'); }, getAuto: function () { return get(LS.auto, '1') === '1'; },
    onChange: function (f) { listeners.push(f); }
  };
  window.TukosokoPrinter = api;
})();
