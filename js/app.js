/* DeepVerify app shell: hash routing, theme, shared state */
(function () {
  'use strict';
  var DV = window.DV;
  var html = DV.html;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;

  var APP_ROUTES = ['image', 'video', 'batch', 'reports', 'settings'];
  var NAV = [
    { id: 'image', label: 'Image detection', icon: 'image' },
    { id: 'video', label: 'Video detection', icon: 'video' },
    { id: 'batch', label: 'Batch processing', icon: 'layers' },
    { id: 'reports', label: 'Reports', icon: 'file' },
    { id: 'settings', label: 'Settings', icon: 'sliders' }
  ];

  function readHash() {
    var h = '';
    try { h = (window.location.hash || '').replace(/^#\/?/, ''); } catch (e) { h = ''; }
    return h;
  }
  function systemDark() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); } catch (e) { return false; }
  }
  function effectiveDark() {
    var t = null;
    try { t = document.documentElement.getAttribute('data-theme'); } catch (e) { t = null; }
    return t ? t === 'dark' : systemDark();
  }

  DV.App = function App() {
    var a = useState(readHash), hash = a[0], setHash = a[1];
    var b = useState(DV.loadSettings), settings = b[0], setSettings = b[1];
    var c = useState(DV.loadHistory), history = c[0], setHistory = c[1];
    var d = useState(''), reportId = d[0], setReportId = d[1];
    var e = useState(false), isDark = e[0], setIsDark = e[1];
    var themeTouched = useRef(settings.theme !== 'system');

    useEffect(function () {
      function onHash() { setHash(readHash()); }
      window.addEventListener('hashchange', onHash);
      return function () { window.removeEventListener('hashchange', onHash); };
    }, []);

    /* theme: only override the viewer's own setting once the person chose one */
    useEffect(function () {
      var root = document.documentElement;
      if (settings.theme === 'system') {
        if (themeTouched.current) root.removeAttribute('data-theme');
      } else { themeTouched.current = true; root.setAttribute('data-theme', settings.theme); }
      setIsDark(effectiveDark());
    }, [settings.theme]);

    useEffect(function () { DV.saveSettings(settings); }, [settings]);

    var route = APP_ROUTES.indexOf(hash) !== -1 ? hash : 'home';

    useEffect(function () {
      if (route !== 'home') { window.scrollTo(0, 0); return; }
      if (hash && hash !== 'home') {
        var el = document.getElementById(hash);
        if (el) { setTimeout(function () { el.scrollIntoView(); }, 30); return; }
      }
      window.scrollTo(0, 0);
    }, [hash]);

    function addResult(res) {
      setHistory(function (list) {
        var next = [res].concat(list.filter(function (r) { return r.id !== res.id; }));
        DV.saveHistory(next);
        return next;
      });
    }
    function removeResult(id) {
      setHistory(function (list) { var next = list.filter(function (r) { return r.id !== id; }); DV.saveHistory(next); return next; });
    }
    function clearHistory() { setHistory([]); DV.saveHistory([]); setReportId(''); }
    function openReport(id) { setReportId(id); window.location.hash = '#reports'; }
    function toggleTheme() {
      var next = effectiveDark() ? 'light' : 'dark';
      setSettings(function (s) { return Object.assign({}, s, { theme: next }); });
    }

    if (route === 'home') return html`<${DV.Landing} isDark=${isDark} onToggleTheme=${toggleTheme} />`;

    var page;
    if (route === 'image') page = html`<${DV.ImagePage} settings=${settings} onResult=${addResult} onOpenReport=${openReport} />`;
    else if (route === 'video') page = html`<${DV.VideoPage} settings=${settings} onResult=${addResult} onOpenReport=${openReport} />`;
    else if (route === 'batch') page = html`<${DV.BatchPage} settings=${settings} onResult=${addResult} />`;
    else if (route === 'reports') page = html`<${DV.ReportsPage} settings=${settings} history=${history} reportId=${reportId} onSelect=${setReportId} onDelete=${removeResult} onClear=${clearHistory} />`;
    else page = html`<${DV.SettingsPage} settings=${settings} onSettings=${setSettings} onClearHistory=${clearHistory} />`;

    var api = settings.mode === 'api' && settings.apiBase;
    return html`<div className="app">
      <aside className="side">
        <a className="brand" href="#home"><${DV.Logo} /><span>DeepVerify</span></a>
        <nav className="side-nav" aria-label="Dashboard">
          ${NAV.map(function (n) {
            return html`<a key=${n.id} href=${'#' + n.id} className=${'side-link' + (route === n.id ? ' is-on' : '')} aria-current=${route === n.id ? 'page' : undefined}
              onClick=${function () { if (n.id === 'reports') setReportId(''); }}><${DV.Icon} name=${n.icon} size=${18} /><span>${n.label}</span></a>`;
          })}
        </nav>
        <a className="side-back" href="#home"><${DV.Icon} name="back" size=${16} /><span>Back to site</span></a>
      </aside>
      <div className="main">
        <div className="topbar">
          <span className=${'engine-chip' + (api ? ' is-api' : '')}><i className="dot"></i>${api ? 'Connected to your API' : 'Demo engine: scores are simulated'}</span>
          <button type="button" className="icon-btn" onClick=${toggleTheme} aria-label="Switch between light and dark theme"><${DV.Icon} name=${isDark ? 'sun' : 'moon'} size=${18} /></button>
        </div>
        <main className="main-in">${page}</main>
      </div>
    </div>`;
  };

  var rootEl = document.getElementById('root');
  if (rootEl) ReactDOM.createRoot(rootEl).render(html`<${DV.App} />`);
})();
