import { useEffect, useMemo, useState } from 'react';
import { Activity, Bookmark, BookmarkCheck, ChartNoAxesCombined, ChevronDown, ExternalLink, Globe2, History, Menu, Moon, Search, Settings, Sun, TrendingUp, X } from 'lucide-react';

type Page = 'explore' | 'trending' | 'saved' | 'settings';
type SavedSearch = { query: string; geo: string; date: string; category: string; property: string; savedAt: string };

declare global { interface Window { trends?: { embed?: { renderExploreWidgetTo: (target: HTMLElement, type: string, request: { comparisonItem: Array<{ keyword: string; geo: string; time: string }>; category: number; property: string }, options: Record<string, string>) => void } } } }

const ranges = [
  ['now 1-H', 'Past hour'], ['now 4-H', 'Past 4 hours'], ['now 1-d', 'Past 24 hours'], ['now 7-d', 'Past 7 days'],
  ['today 1-m', 'Past 30 days'], ['today 3-m', 'Past 3 months'], ['today 12-m', 'Past 12 months'], ['today 5-y', 'Past 5 years'], ['all', '2004–present'],
];
const countries = [['', 'Worldwide'], ['LK', 'Sri Lanka'], ['US', 'United States'], ['GB', 'United Kingdom'], ['IN', 'India'], ['AU', 'Australia'], ['CA', 'Canada'], ['SG', 'Singapore'], ['MY', 'Malaysia'], ['DE', 'Germany'], ['FR', 'France'], ['JP', 'Japan'], ['NZ', 'New Zealand']];
const categories = [['0', 'All categories'], ['3', 'Arts & Entertainment'], ['5', 'Beauty & Fitness'], ['7', 'Books & Literature'], ['11', 'Business & Industrial'], ['13', 'Computers & Electronics'], ['14', 'Finance'], ['16', 'Food & Drink'], ['18', 'Games'], ['20', 'Health'], ['22', 'Internet & Telecom'], ['23', 'Jobs & Education'], ['29', 'News']];
const properties = [['', 'Web Search'], ['images', 'Image Search'], ['news', 'News Search'], ['froogle', 'Google Shopping'], ['youtube', 'YouTube Search']];
const trendTypes = [
  { id: 'TIMESERIES', title: 'Interest over time', desc: 'How search interest changes over your selected period.', icon: Activity },
  { id: 'GEO_MAP', title: 'Interest by region', desc: 'Where people are searching for this term.', icon: Globe2 },
  { id: 'RELATED_TOPICS', title: 'Related topics', desc: 'Topics people also search for.', icon: ChartNoAxesCombined },
  { id: 'RELATED_QUERIES', title: 'Related queries', desc: 'Search terms associated with your keyword.', icon: Search },
];
const embedLoader = 'https://ssl.gstatic.com/trends_nrtr/4031_RC01/embed_loader.js';

function TrendsWidget({ type, query, geo, date, category, property }: { type: string; query: string; geo: string; date: string; category: string; property: string }) {
  const [failed, setFailed] = useState(false);
  const exploreUrl = useMemo(() => {
    const p = new URLSearchParams({ date, q: query });
    if (geo) p.set('geo', geo);
    if (category !== '0') p.set('cat', category);
    if (property) p.set('gprop', property);
    return `https://trends.google.com/trends/explore?${p.toString()}`;
  }, [query, geo, date, category, property]);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    const host = document.getElementById(`widget-${type}`);
    if (!host) return;
    host.innerHTML = '';
    const render = () => {
      if (cancelled || !window.trends?.embed?.renderExploreWidgetTo) { if (!cancelled) setFailed(true); return; }
      try {
        const exploreQuery = new URLSearchParams({ date, q: query });
        if (geo) exploreQuery.set('geo', geo);
        if (category !== '0') exploreQuery.set('cat', category);
        if (property) exploreQuery.set('gprop', property);
        const request = {
          comparisonItem: [{ keyword: query, geo, time: date }],
          category: Number(category),
          property,
        };
        window.trends.embed.renderExploreWidgetTo(host, type, request, {
          exploreQuery: exploreQuery.toString(),
          guestPath: 'https://trends.google.com:443/trends/embed/',
        });
        window.setTimeout(() => { if (!cancelled && host.childElementCount === 0) setFailed(true); }, 9000);
      } catch { setFailed(true); }
    };
    const existing = document.querySelector<HTMLScriptElement>('script[data-trends-loader="true"]');
    if (window.trends?.embed?.renderExploreWidgetTo) render();
    else if (existing) existing.addEventListener('load', render, { once: true });
    else {
      const script = document.createElement('script');
      script.src = embedLoader;
      script.async = true;
      script.dataset.trendsLoader = 'true';
      script.onload = render;
      script.onerror = () => { if (!cancelled) setFailed(true); };
      document.head.appendChild(script);
    }
    return () => { cancelled = true; };
  }, [type, query, geo, date, category, property]);

  return <div className="widget-frame">
    <div id={`widget-${type}`} className="google-widget" />
    {failed && <div className="widget-fallback"><div className="fallback-icon"><ExternalLink size={20}/></div><strong>Google's embedded chart couldn't load here.</strong><span>Open the same search directly on Google Trends to view this section.</span><a href={exploreUrl} target="_blank" rel="noreferrer">Open in Google Trends <ExternalLink size={14}/></a></div>}
  </div>;
}

export default function App() {
  const [page, setPage] = useState<Page>('explore');
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [geo, setGeo] = useState('');
  const [date, setDate] = useState('today 12-m');
  const [category, setCategory] = useState('0');
  const [property, setProperty] = useState('');
  const [dark, setDark] = useState(() => localStorage.getItem('slq-theme') === 'dark');
  const [saved, setSaved] = useState<SavedSearch[]>(() => { try { return JSON.parse(localStorage.getItem('slq-saved') || '[]') as SavedSearch[]; } catch { return []; } });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');

  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('slq-theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => { localStorage.setItem('slq-saved', JSON.stringify(saved)); }, [saved]);

  const googleExploreUrl = useMemo(() => {
    const p = new URLSearchParams({ date, q: activeQuery });
    if (geo) p.set('geo', geo);
    if (category !== '0') p.set('cat', category);
    if (property) p.set('gprop', property);
    return `https://trends.google.com/trends/explore?${p.toString()}`;
  }, [activeQuery, date, geo, category, property]);

  const doSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const value = query.trim();
    if (!value) { setSearchError('Enter a search term to explore.'); return; }
    setSearchError(''); setActiveQuery(value); setPage('explore'); setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const isSaved = saved.some(s => s.query.toLowerCase() === activeQuery.toLowerCase() && s.geo === geo && s.date === date && s.category === category && s.property === property);
  const toggleSave = () => {
    if (!activeQuery) return;
    if (isSaved) setSaved(prev => prev.filter(s => !(s.query.toLowerCase() === activeQuery.toLowerCase() && s.geo === geo && s.date === date && s.category === category && s.property === property)));
    else setSaved(prev => [{ query: activeQuery, geo, date, category, property, savedAt: new Date().toISOString() }, ...prev]);
  };
  const loadSaved = (s: SavedSearch) => { setQuery(s.query); setActiveQuery(s.query); setGeo(s.geo); setDate(s.date); setCategory(s.category); setProperty(s.property); setPage('explore'); };
  const nav = [{ id: 'explore' as const, label: 'Explore', icon: Search }, { id: 'trending' as const, label: 'Trending now', icon: TrendingUp }, { id: 'saved' as const, label: 'Saved searches', icon: Bookmark }, { id: 'settings' as const, label: 'Settings', icon: Settings }];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="brand"><div className="brand-mark">S</div><div className="brand-name">SwiftLink<span>IQ</span></div><button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18}/></button></div>
      <div className="sidebar-caption">DISCOVER</div>
      <nav>{nav.map(item => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => { setPage(item.id); setMobileOpen(false); }}><Icon size={18}/><span>{item.label}</span>{item.id === 'saved' && saved.length > 0 && <small>{saved.length}</small>}</button>; })}</nav>
      <div className="sidebar-bottom"><div className="source-note"><span className="source-dot"/> <span>Search interest data by Google Trends</span></div><a href="https://swiftlinkceylontours.com/" target="_blank" rel="noreferrer">SwiftLink Ceylon Tours <ExternalLink size={12}/></a></div>
    </aside>
    {mobileOpen && <button className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={20}/></button><div className="breadcrumb">SwiftLinkIQ <span>/</span> {nav.find(n => n.id === page)?.label}</div><div className="top-actions"><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle theme" title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button></div></header>
      <div className="content">
        {page === 'explore' && <>
          <section className="hero"><div className="eyebrow"><span/> SEARCH TRENDS EXPLORER</div><h1>Explore what the world<br className="desktop-break"/> is searching for.</h1><p>Discover search interest, regional popularity and related searches.</p>
            <form className="search-panel" onSubmit={doSearch}><Search size={21}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter a search term or topic" aria-label="Search term"/><button type="submit">Explore <span>→</span></button></form>{searchError && <div className="error-text">{searchError}</div>}
            <div className="filters"><label><span>LOCATION</span><div className="select-wrap"><Globe2 size={15}/><select value={geo} onChange={e => setGeo(e.target.value)}>{countries.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select><ChevronDown size={14}/></div></label><label><span>TIME RANGE</span><div className="select-wrap"><History size={15}/><select value={date} onChange={e => setDate(e.target.value)}>{ranges.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select><ChevronDown size={14}/></div></label><label><span>CATEGORY</span><div className="select-wrap"><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select><ChevronDown size={14}/></div></label><label><span>SEARCH TYPE</span><div className="select-wrap"><select value={property} onChange={e => setProperty(e.target.value)}>{properties.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select><ChevronDown size={14}/></div></label></div>
          </section>
          {!activeQuery ? <section className="welcome-state"><div className="welcome-icon"><TrendingUp size={27}/></div><h2>Start with a search</h2><p>Enter a keyword above to explore its search interest, locations and related searches.</p><div className="suggestions"><button onClick={() => { setQuery('sri lanka tours'); setActiveQuery('sri lanka tours'); }}>sri lanka tours</button><button onClick={() => { setQuery('coffee'); setActiveQuery('coffee'); }}>coffee</button><button onClick={() => { setQuery('electric cars'); setActiveQuery('electric cars'); }}>electric cars</button></div></section> : <section className="results-section">
            <div className="results-heading"><div><div className="eyebrow">SEARCH EXPLORATION</div><h2>{activeQuery}</h2><div className="result-meta">{countries.find(c => c[0] === geo)?.[1] || 'Worldwide'} <span>·</span> {ranges.find(r => r[0] === date)?.[1]} <span>·</span> {categories.find(c => c[0] === category)?.[1]} <span>·</span> {properties.find(p => p[0] === property)?.[1]}</div></div><div className="result-actions"><button className={`outline-button ${isSaved ? 'saved' : ''}`} onClick={toggleSave}>{isSaved ? <BookmarkCheck size={16}/> : <Bookmark size={16}/>} {isSaved ? 'Saved' : 'Save search'}</button><a className="outline-button" href={googleExploreUrl} target="_blank" rel="noreferrer">Open full report <ExternalLink size={14}/></a></div></div>
            <div className="data-note"><span className="source-dot"/> Charts are embedded from Google Trends. Search-interest values are relative (0–100), not absolute search counts. <a href="https://support.google.com/trends/answer/4365538" target="_blank" rel="noreferrer">About this data</a></div>
            <div className="widget-grid">{trendTypes.map(t => { const Icon = t.icon; return <article className={`widget-card ${t.id === 'TIMESERIES' ? 'wide' : ''}`} key={t.id}><div className="widget-title"><div className="widget-icon"><Icon size={17}/></div><div><h3>{t.title}</h3><p>{t.desc}</p></div><a href={googleExploreUrl} target="_blank" rel="noreferrer" aria-label={`Open ${t.title} in Google Trends`}><ExternalLink size={15}/></a></div><TrendsWidget type={t.id} query={activeQuery} geo={geo} date={date} category={category} property={property}/></article>; })}</div>
            <div className="google-attribution">Data source: <a href="https://trends.google.com/" target="_blank" rel="noreferrer">Google Trends</a>. SwiftLinkIQ is an independent interface and is not affiliated with Google.</div>
          </section>}
        </>}
        {page === 'trending' && <section className="simple-page"><div className="eyebrow">DISCOVER WHAT'S POPULAR</div><h1>Trending now</h1><p>Explore Google's live trending searches by country. Trending Now is provided by Google Trends and opens in a separate tab.</p><div className="trending-card"><div className="trending-symbol"><TrendingUp size={26}/></div><div><h2>Google Trends — Trending Now</h2><p>Browse active trends, search volume ranges and trend breakdowns.</p></div><a className="primary-link" href="https://trends.google.com/trending" target="_blank" rel="noreferrer">View trending searches <ExternalLink size={15}/></a></div><div className="info-panel"><strong>Why does this open Google?</strong><p>Google publishes a public BigQuery dataset for selected top and rising queries, not every search. SwiftLinkIQ does not currently connect to a BigQuery backend, so it does not invent or display incomplete trending lists.</p><a href="https://support.google.com/trends/answer/12764470" target="_blank" rel="noreferrer">Learn about Google's public Trends dataset <ExternalLink size={13}/></a></div></section>}
        {page === 'saved' && <section className="simple-page"><div className="eyebrow">YOUR PERSONAL LIBRARY</div><h1>Saved searches</h1><p>Searches are stored locally in this browser. They are not synced across devices.</p>{saved.length === 0 ? <div className="empty-card"><Bookmark size={24}/><h2>No saved searches yet</h2><p>Explore a keyword and use Save search to keep it here.</p><button className="primary-link" onClick={() => setPage('explore')}>Explore a keyword</button></div> : <div className="saved-list">{saved.map((s,i) => <div className="saved-row" key={`${s.query}-${s.geo}-${s.date}-${i}`}><button className="saved-query" onClick={() => loadSaved(s)}><strong>{s.query}</strong><span>{countries.find(c => c[0] === s.geo)?.[1] || 'Worldwide'} · {ranges.find(r => r[0] === s.date)?.[1]}</span></button><button className="icon-button danger" onClick={() => setSaved(prev => prev.filter((_,idx) => idx !== i))} aria-label="Remove saved search"><X size={17}/></button></div>)}</div>}</section>}
        {page === 'settings' && <section className="simple-page"><div className="eyebrow">PREFERENCES</div><h1>Settings</h1><p>Customize your SwiftLinkIQ experience.</p><div className="settings-card"><div><strong>Appearance</strong><span>Choose the interface theme.</span></div><button className="outline-button" onClick={() => setDark(!dark)}>{dark ? <Sun size={16}/> : <Moon size={16}/>} {dark ? 'Light mode' : 'Dark mode'}</button></div><div className="settings-card"><div><strong>Saved searches</strong><span>{saved.length} searches stored in this browser.</span></div><button className="outline-button danger" onClick={() => { setSaved([]); setSettingsMessage('Saved searches cleared from this browser.'); }}>Clear saved searches</button></div>{settingsMessage && <div className="success-text">{settingsMessage}</div>}<div className="info-panel"><strong>About SwiftLinkIQ</strong><p>A lightweight search-trends interface inspired by Google Trends and styled for SwiftLink Ceylon Tours.</p><a href="https://swiftlinkceylontours.com/" target="_blank" rel="noreferrer">Visit the main website <ExternalLink size={13}/></a></div></section>}
        <footer className="footer"><span>© {new Date().getFullYear()} SwiftLinkIQ</span><span>Search trends, made simple.</span></footer>
      </div>
    </main>
  </div>;
}
