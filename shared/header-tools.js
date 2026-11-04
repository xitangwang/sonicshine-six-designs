(()=>{'use strict';
const zh=document.documentElement.lang.toLowerCase().startsWith('zh');
const bar=document.querySelector('.ss-tools');if(!bar)return;
const lang=bar.querySelector('[data-top-language]'),pop=bar.querySelector('.ss-lang-pop'),search=bar.querySelector('[data-top-search]');
// These are real, relative links. Refresh the state at use time as a user
// may have changed a comparison, drawing selection, or section since load.
const editions=[...pop.querySelectorAll('a[data-ss-edition]')].map(a=>[a,a.getAttribute('href').split(/[?#]/,1)[0]]);
function syncEditions(){for(const [a,path] of editions)a.setAttribute('href',path+location.search+location.hash)}
pop.addEventListener('click',e=>{if(e.target.closest('a[data-ss-edition]'))syncEditions()});
function closeLang(returnFocus){pop.hidden=true;lang.setAttribute('aria-expanded','false');if(returnFocus)lang.focus()}
lang.addEventListener('click',()=>{if(!pop.hidden){closeLang(false);return}syncEditions();pop.hidden=false;lang.setAttribute('aria-expanded','true')});
document.addEventListener('click',e=>{if(!pop.hidden&&!e.target.closest('.ss-lang-wrap'))closeLang(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pop.hidden){e.preventDefault();closeLang(true)}});
bar.querySelector('.ss-lang-wrap').addEventListener('focusout',e=>{if(e.relatedTarget&&!bar.querySelector('.ss-lang-wrap').contains(e.relatedTarget))closeLang(false)});
let dlg;
function panel(){if(dlg)return dlg;dlg=document.createElement('dialog');dlg.className='ss-search-dialog';dlg.setAttribute('aria-labelledby','ss-search-heading');dlg.innerHTML='<div class="ss-search-top"><h2 id="ss-search-heading">Search Sonic Shine</h2><button type="button" class="ss-search-x" aria-label="Close search">×</button></div><div class="ss-search-main"><label for="ss-search-query">Search equipment, applications, cases and resources</label><input id="ss-search-query" type="search" placeholder="e.g. multi-stage, workpiece or trial" autocomplete="off"><div role="status" aria-live="polite"></div><ul class="ss-search-results"></ul></div>';if(zh){dlg.querySelector('h2').textContent='搜索 Sonic Shine';dlg.querySelector('.ss-search-x').setAttribute('aria-label','关闭搜索');dlg.querySelector('label').textContent='搜索设备、行业应用、案例与资料';dlg.querySelector('input').placeholder='例如：多槽、盲孔、项目议程或试洗'}document.body.append(dlg);dlg.querySelector('.ss-search-x').onclick=()=>dlg.close();dlg.addEventListener('close',()=>{search.setAttribute('aria-expanded','false');search.focus()});dlg.addEventListener('click',e=>{if(e.target!==dlg)return;const b=dlg.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dlg.close()});dlg.querySelector('input').addEventListener('input',render);dlg.querySelector('input').addEventListener('keydown',e=>{if(e.key==='ArrowDown'){const first=dlg.querySelector('li a');if(first){e.preventDefault();first.focus()}}});return dlg}
const norm=v=>String(v||'').toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
function render(){const all=(window.SonicTopIndex||{})[bar.dataset.variant]||[],input=dlg.querySelector('input'),query=norm(input.value),terms=query.split(' ').filter(Boolean),ul=dlg.querySelector('ul');ul.replaceChildren();let pages=all.filter(x=>x.url!=='index.html');
if(query){pages=pages.map(p=>{const t=norm(p.title),k=norm(p.keywords),d=norm(p.description),u=norm(p.url),ty=norm(p.type);let score=0;for(const token of terms){let w=(t.includes(token)?8:0)+(ty.includes(token)?5:0)+(u.includes(token)?4:0)+(k.includes(token)?2:0)+(d.includes(token)?1:0);if(!w)return {p,w:0};score+=w}return{p,w:score+(t.includes(query)?10:0)}}).filter(x=>x.w>0).sort((a,b)=>b.w-a.w).map(x=>x.p)}
else {const order=['products.html','applications.html','cases.html','resources.html','contact.html'];pages=order.map(x=>all.find(p=>p.url===x)).filter(Boolean)}
dlg.querySelector('[role=status]').textContent=zh?(query?(pages.length?'找到 '+pages.length+' 个页面':'没有找到匹配页面。试试“设备”“试洗”或“资源”。'):'常用入口'):(query?(pages.length?pages.length+' matching page'+(pages.length===1?'':'s'):'No matching pages. Try “systems”, “trial” or “resources”.'):'Quick links');
for(const p of pages){if(!/^[\w-]+\.html$/.test(p.url))continue;const li=document.createElement('li'),a=document.createElement('a');a.href=p.url;for(const [tag,v] of [['small',p.type],['strong',p.title],['span',p.description]]){const el=document.createElement(tag);el.textContent=v||'';a.append(el)}li.append(a);ul.append(li)}}
search.addEventListener('click',()=>{closeLang(false);panel();dlg.querySelector('input').value='';render();dlg.showModal();search.setAttribute('aria-expanded','true');dlg.querySelector('input').focus()});
})();
