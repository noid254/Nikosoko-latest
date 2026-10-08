/* Tukosoko POS — PWA glue: service worker, install prompt, mobile bottom nav, Bluetooth printer controls. */
(function () {
  'use strict';
  var P = window.TukosokoPrinter;

  // ---- head tags (fallback if not already in the Blade layout) ----
  function head(tag, attrs) {
    var sel = tag + Object.keys(attrs).filter(function (k) { return k === 'rel' || k === 'name'; }).map(function (k) { return '[' + k + '="' + attrs[k] + '"]'; }).join('');
    if (document.head.querySelector(sel)) return;
    var el = document.createElement(tag); Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); }); document.head.appendChild(el);
  }
  head('link', { rel: 'manifest', href: '/manifest.webmanifest' });
  head('meta', { name: 'theme-color', content: '#C9A227' });
  head('meta', { name: 'mobile-web-app-capable', content: 'yes' });
  head('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' });
  head('link', { rel: 'apple-touch-icon', href: '/pwa/icons/icon-192.png' });

  // ---- service worker ----
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }

  // ---- toast ----
  var toastEl;
  function toast(msg, ms) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'tk-toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.style.display = 'block';
    clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.style.display = 'none'; }, ms || 3200);
  }

  // ---- install prompt ----
  var deferred;
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    var seen = 0; try { seen = +localStorage.getItem('tk.install.dismissed') || 0; } catch (x) {}
    if (standalone || Date.now() - seen < 7 * 864e5) return;
    var bar = document.createElement('div'); bar.className = 'tk-install';
    bar.innerHTML = '<div style="flex:1"><strong>Install Tukosoko POS</strong><span>Faster launch, full screen, works like an app.</span></div>' +
      '<button class="btn btn-default btn-sm" data-x>Later</button><button class="btn btn-primary btn-sm" data-i>Install</button>';
    document.body.appendChild(bar);
    bar.querySelector('[data-x]').onclick = function () { try { localStorage.setItem('tk.install.dismissed', Date.now()); } catch (x) {} bar.remove(); };
    bar.querySelector('[data-i]').onclick = function () { deferred.prompt(); deferred.userChoice.then(function () { bar.remove(); deferred = null; }); };
  });
  window.addEventListener('appinstalled', function () { toast('Tukosoko POS installed'); });

  // ---- mobile bottom navigation (thumb-reach shortcuts to the screens cashiers use all day) ----
  var path = location.pathname;
  var items = [
    { href: '/home', icon: 'fa-home', label: 'Home', match: /^\/home/ },
    { href: '/sells', icon: 'fa-receipt', label: 'Sales', match: /^\/sells/ },
    { href: '/pos/create', icon: 'fa-plus', label: 'Sell', match: /^\/pos/, cls: 'sell' },
    { href: '/products', icon: 'fa-box', label: 'Products', match: /^\/products/ },
    { href: '/contacts?type=customer', icon: 'fa-users', label: 'Customers', match: /^\/contacts/ }
  ];
  function buildNav() {
    if (document.querySelector('.tk-bottomnav') || !document.querySelector('.main-header')) return; // only on logged-in pages
    var nav = document.createElement('nav'); nav.className = 'tk-bottomnav'; nav.setAttribute('aria-label', 'Main');
    nav.innerHTML = items.map(function (i) {
      var on = i.match.test(path) ? ' active' : '';
      return '<a href="' + i.href + '" class="' + (i.cls || '') + on + '"><i class="fa ' + i.icon + '"></i>' + (i.cls ? '' : '<span>' + i.label + '</span>') + '</a>';
    }).join('');
    document.body.appendChild(nav);
  }

  // ---- printer FAB ----
  function buildPrinterUI() {
    if (!P || document.querySelector('.tk-fab') || !document.querySelector('.main-header')) return;
    var fab = document.createElement('button'); fab.className = 'tk-fab'; fab.type = 'button'; fab.title = 'Bluetooth printer';
    fab.innerHTML = '<i class="fa fa-print"></i><span class="dot"></span>';
    document.body.appendChild(fab);
    function paint(on) { fab.classList.toggle('on', !!on); }
    P.onChange(paint);

    fab.onclick = async function () {
      if (!P.supported()) { toast('Bluetooth printing needs Chrome/Edge on Android or desktop'); return; }
      try {
        if (!P.isConnected()) { if (await P.reconnect() || await P.connect()) toast('Connected: ' + P.name()); return; }
        var receipt = findReceipt();
        if (receipt) { await P.printElement(receipt); toast('Receipt sent to printer'); }
        else if (confirm('Connected to ' + P.name() + '.\nPrint a test page? (Cancel to disconnect)')) { await P.printText('Tukosoko POS\nPrinter test OK\n' + new Date().toLocaleString()); }
        else { P.disconnect(); toast('Printer disconnected'); }
      } catch (e) { toast('Printer: ' + (e.message || e)); }
    };
    if (localStorage.getItem('tk.printer.id')) P.reconnect().then(paint);
  }

  function findReceipt() {
    var sel = ['.modal.in #receipt_section', '.modal.in .print_section', '.modal.in .invoice-print', '#receipt_section', '.print_section'];
    for (var i = 0; i < sel.length; i++) { var el = document.querySelector(sel[i]); if (el && el.offsetParent !== null && el.textContent.trim()) return el; }
    return null;
  }

  // ---- route Ultimate POS's receipt printing through Bluetooth ----
  function hookPrint() {
    if (!P || typeof window.__print_receipt !== 'function' || window.__print_receipt.__tk) return;
    var orig = window.__print_receipt;
    var wrapped = function (divId) {
      var paired = false; try { paired = !!localStorage.getItem('tk.printer.id'); } catch (e) {}
      if (!P.supported() || !paired || !P.getAuto()) return orig.apply(this, arguments);
      var self = this, args = arguments;
      P.printElement(divId).then(function () { toast('Printed via Bluetooth'); })
        .catch(function (e) { toast('Bluetooth failed (' + (e.message || e) + ') — using normal print'); orig.apply(self, args); });
    };
    wrapped.__tk = true; window.__print_receipt = wrapped;
  }

  function init() { buildNav(); buildPrinterUI(); hookPrint(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('load', hookPrint); // functions.js may define __print_receipt after DOMContentLoaded
})();
