/* Each hub route has native HTML in its own language. The root is always English
   unless a legacy link explicitly requests Chinese. No stored preference redirects it. */
(() => {
  'use strict';
  const data = JSON.parse(document.querySelector('#hub-data').textContent);
  const currentUrl = new URL(location.href);
  const languages = [...document.querySelectorAll('a[data-edition]')];
  const nativeHref = new Map(languages.map(a => [a.dataset.edition, new URL(a.getAttribute('href'), currentUrl)]));
  const forced = (currentUrl.searchParams.get('lang') || '').toLowerCase();
  const explicit = (forced === 'zh-cn' || forced === 'zh' || forced === 'zh-hans') ? 'zh-CN' : forced === 'en' ? 'en' : '';
  if (explicit && explicit !== data.lang && nativeHref.has(explicit)) {
    const destination = new URL(nativeHref.get(explicit));
    destination.search = currentUrl.search;
    destination.searchParams.set('lang', explicit);
    destination.hash = currentUrl.hash;
    location.replace(destination.href);
    return;
  }

  const ts = [...document.querySelectorAll('[role=tab]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const first = document.querySelector('#first'), second = document.querySelector('#second');
  const menu = document.querySelector('details.hub-language');
  let pane = 0, era = 'all', ready = false;
  function syncEditionLinks() {
    if (!ready) return;
    for (const link of languages) {
      const u = new URL(nativeHref.get(link.dataset.edition));
      u.search = location.search;
      u.hash = location.hash;
      u.searchParams.set('lang', link.dataset.edition);
      if (pane) u.searchParams.set('pane', String(pane)); else u.searchParams.delete('pane');
      if (era !== 'all') u.searchParams.set('group', era); else u.searchParams.delete('group');
      u.searchParams.set('left', first.value);
      u.searchParams.set('right', second.value);
      link.href = u.href;
    }
  }
  if (menu) {
    document.addEventListener('click', e => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.open) { e.preventDefault(); menu.open = false; menu.querySelector('summary').focus(); }
    });
    menu.addEventListener('focusout', e => { if (e.relatedTarget && !menu.contains(e.relatedTarget)) menu.open = false; });
    menu.addEventListener('toggle', syncEditionLinks);
  }
  window.addEventListener('hashchange', syncEditionLinks);
  function activate(n) {
    pane = n;
    ts.forEach((t,i) => {
      t.tabIndex = i === n ? 0 : -1;
      t.setAttribute('aria-selected', String(i === n));
      document.querySelector('#p'+i).hidden = i !== n;
    });
    syncEditionLinks();
  }
  ts.forEach((t,i) => {
    t.onclick = () => activate(i);
    t.onkeydown = e => {
      const n = {ArrowRight:(i+1)%ts.length,ArrowLeft:(i+ts.length-1)%ts.length,Home:0,End:ts.length-1}[e.key];
      if (n !== undefined) {e.preventDefault();activate(n);ts[n].focus();}
    };
  });
  const requestedPane = Number(currentUrl.searchParams.get('pane'));
  activate(Number.isInteger(requestedPane) && requestedPane >= 0 && requestedPane < ts.length ? requestedPane : 0);
  function show(what) {
    era = what;
    filters.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === what)));
    document.querySelectorAll('#cards article').forEach(c => c.hidden = what !== 'all' && c.dataset.era !== what);
    syncEditionLinks();
  }
  filters.forEach(b => b.onclick = () => show(b.dataset.filter));
  const requestedFilter = currentUrl.searchParams.get('group');
  show(['new', 'old'].includes(requestedFilter) ? requestedFilter : 'all');
  const known = s => data.rows.some(r => r.l === s);
  first.value = known(currentUrl.searchParams.get('left')) ? currentUrl.searchParams.get('left') : 'd';
  second.value = known(currentUrl.searchParams.get('right')) ? currentUrl.searchParams.get('right') : 'e';
  function compare(changed) {
    if (first.value === second.value) {
      const keep = changed || first;
      (keep === first ? second : first).value = data.rows.find(r => r.l !== keep.value).l;
    }
    const box = document.querySelector('#compare-output');
    box.replaceChildren();
    const pair = document.createElement('div');pair.className='cmp-pair';box.append(pair);
    for (const letter of [first.value, second.value]) {
      const r=data.rows.find(row=>row.l===letter),article=document.createElement('article');
      article.style.borderTop='4px solid '+r.co;
      const img=document.createElement('img');img.src=data.asset+'preview-'+letter+data.imgSuffix+'.webp';img.alt=r.title;
      const h=document.createElement('h3');h.textContent=letter.toUpperCase()+' / '+r.title;
      const dl=document.createElement('dl');
      r.specs.forEach((val,i)=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=data.labels[i];dd.textContent=val;dl.append(dt,dd);});
      const a=document.createElement('a');a.href=data.site+letter+'/index.html';a.textContent=data.open+' ↗';
      article.append(img,h,dl,a);pair.append(article);
    }
    syncEditionLinks();
  }
  first.onchange=()=>compare(first);
  second.onchange=()=>compare(second);
  compare(first);
  ready=true;
  syncEditionLinks();
})();
