/* Progressive navigation: category links work normally until the disclosures are ready. */
(()=>{'use strict';
const script=document.currentScript,shared=new URL('.',script.src),header=document.querySelector('header'),nav=header?.querySelector('nav'),variant=document.querySelector('.ss-tools')?.dataset.variant;
const data=window.SonicNavigation?.[variant],zh=/^zh/i.test(document.documentElement.lang),li=zh?1:0;
if(!nav||!data||nav.dataset.disclosures)return;
const original=[...nav.children].filter(n=>n.tagName==='A'),ids=['products','applications','cases','about','news','contact'];
if(original.length!==7||ids.some(id=>!data[id]))return;
const $=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
const icon=(kind)=>{const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('focusable','false');s.setAttribute('aria-hidden','true');const p=document.createElementNS(s.namespaceURI,'path');p.setAttribute('d',({down:'m5 9 7 7 7-7',out:'M6 18 18 6M7 6h11v11',right:'M4 12h15m-5-5 5 5-5 5',download:'M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4'})[kind]);s.append(p);return s};
const mainToggle=header.querySelector('[aria-controls="'+nav.id+'"]'),row=nav.parentElement,home=original[0];header.classList.add('mn-shell');header.dataset.mnVariant=variant;nav.classList.add('mn-nav');nav.dataset.disclosures='true';row.classList.add('mn-navrow');home.classList.add('mn-home');mainToggle?.classList.add('mn-main-toggle');
const media=matchMedia('(max-width:1080px)'),hover=matchMedia('(hover:hover) and (pointer:fine)');let compact=media.matches,active=null,origin=null,timer=0,raf=0,pressing=null;const items=[];
function address(x){return x==='@catalog'?new URL(zh?'overview.zh.pdf':'overview.pdf',shared).href:x}
function makePanel(id,record){const panel=$('section','mn-panel');panel.id='mn-panel-'+id;panel.hidden=true;panel.setAttribute('aria-labelledby','mn-trigger-'+id);
 const columns=$('div','mn-columns'),left=$('div','mn-left'),heading=$('div','mn-kicker',record.kicker[li]),list=$('ul','mn-list');left.append(heading,list);
 record.rows.forEach(r=>{const item=$('li','mn-entry'),link=$(r.action?'button':'a','mn-link');if(r.action){link.type='button';link.dataset.channel=r.action;link.setAttribute('aria-haspopup','dialog')}else{link.href=address(r.url);if(r.url==='@catalog'){link.setAttribute('download','');link.title=zh?'下载设备系列概览（PDF）':'Download the equipment overview (PDF)'}}
 const words=$('span','mn-words'),name=$('span','mn-title',r.label[li]);words.append(name);if(r.desc?.[li])words.append($('span','mn-desc',r.desc[li]));link.append(words,icon(r.url==='@catalog'?'download':'out'));item.append(link);list.append(item)});
 const f=record.feature,card=$('a','mn-promo'+(f.img==='@machine'?' mn-equipment':''));card.href=address(f.url);const art=$('div','mn-art'),img=$('img','mn-img');img.alt='';img.decoding='async';img.dataset.mnSrc=new URL(f.img==='@machine'?'nav-machine.webp':f.img,shared).href;art.append(img);
 const copy=$('div','mn-copy'),cta=$('span','mn-cta',f.cta[li]);cta.append(icon('right'));copy.append($('strong','mn-feature-title',f.label[li]),cta);card.append(art,copy);columns.append(left,card);panel.append(columns);return panel}
for(let i=0;i<6;i++){const a=original[i+1],id=ids[i],wrap=$('div','mn-item'),button=$('button','mn-trigger');button.type='button';button.id='mn-trigger-'+id;button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','mn-panel-'+id);
 if(a.hasAttribute('aria-current'))button.setAttribute('aria-current',a.getAttribute('aria-current'));button.append($('span','mn-label',a.textContent.trim()),icon('down'));const panel=makePanel(id,data[id]);a.replaceWith(wrap);wrap.append(button,panel);items.push({id,wrap,button,panel})}
function cancel(){clearTimeout(timer);timer=0}
function shut(focus=false){cancel();if(!active)return;const old=active;active=null;origin=null;old.button.setAttribute('aria-expanded','false');old.panel.hidden=true;header.classList.remove('mn-showing');if(focus)old.button.focus({preventScroll:true})}
function place(){if(!active||compact)return;const p=active.panel,b=active.button.getBoundingClientRect(),h=header.getBoundingClientRect(),vw=document.documentElement.clientWidth,vh=window.innerHeight;
 if(h.bottom<5||b.bottom<0){shut();return}const available=vw-32,w=Math.min(available,Math.max(640,Math.min(900,vw*.60)));
 const rightmost=Math.min(vw-16,Math.max(...[...row.children].filter(x=>x.getBoundingClientRect().width>0).map(x=>x.getBoundingClientRect().right)));
 p.style.setProperty('--mn-w',w+'px');p.style.setProperty('--mn-x',Math.max(16,Math.min(b.left-18,rightmost-w))+'px');p.style.setProperty('--mn-y',Math.round(h.bottom-1)+'px');p.style.setProperty('--mn-h',Math.max(100,vh-h.bottom-12)+'px')}
function open(it,kind){cancel();if(active!==it){shut();active=it;it.button.setAttribute('aria-expanded','true');it.panel.hidden=false;header.classList.add('mn-showing');const im=it.panel.querySelector('img[data-mn-src]');if(im&&!im.getAttribute('src'))im.src=im.dataset.mnSrc}origin=kind;place()}
function disclosure(it){if(active===it&&origin!=='hover')shut();else open(it,'click')}
function first(it,last){const aa=[...it.panel.querySelectorAll('a,button')];(last?aa.at(-1):aa[0])?.focus({preventScroll:true})}
function refresh(){const next=media.matches;if(next!==compact)shut();compact=next;header.classList.toggle('mn-small',compact);place()}
for(const [idx,it] of items.entries()){
 it.button.addEventListener('click',()=>disclosure(it));
 it.wrap.addEventListener('pointerenter',e=>{if(compact||!hover.matches||e.pointerType!=='mouse')return;cancel();if(active===it)return;timer=setTimeout(()=>open(it,'hover'),95)});
 it.wrap.addEventListener('pointerleave',e=>{if(compact||e.pointerType!=='mouse')return;cancel();if(active===it&&origin==='hover')timer=setTimeout(()=>shut(),235)});
 it.panel.addEventListener('pointerenter',cancel);
 it.button.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open(it,'keyboard');first(it,e.key==='ArrowUp')}else if(!compact&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const next=items[(idx+(e.key==='ArrowLeft'?-1:1)+items.length)%items.length];const expand=!!active;next.button.focus();if(expand)open(next,'keyboard')}});
 it.panel.addEventListener('click',e=>{if(e.target.closest('a,button'))shut()});
}
home.addEventListener('pointerenter',()=>{if(!compact)shut()});
document.addEventListener('pointerdown',e=>{pressing=e.target.closest?.('.mn-trigger')||null;if(active&&!active.wrap.contains(e.target)&&!items.some(it=>it.button.contains(e.target)))shut()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){e.preventDefault();e.stopImmediatePropagation();shut(true)}},true);
document.addEventListener('focusin',e=>{if(active&&!active.wrap.contains(e.target)&&e.target!==pressing)shut()});
for(const ev of ['pointerup','pointercancel'])window.addEventListener(ev,()=>{pressing=null},true);
if(mainToggle)new MutationObserver(()=>{if(mainToggle.getAttribute('aria-expanded')!=='true')shut()}).observe(mainToggle,{attributes:true,attributeFilter:['aria-expanded']});
window.addEventListener('resize',refresh,{passive:true});window.addEventListener('scroll',()=>{if(!active||compact||raf)return;raf=requestAnimationFrame(()=>{raf=0;place()})},{passive:true});media.addEventListener?.('change',refresh);window.addEventListener('pageshow',e=>{shut();refresh();if(e.persisted)return;const requested=new URLSearchParams(location.search).get('menu'),sample=items.find(x=>x.id===requested);if(!sample)return;if(compact&&mainToggle&&mainToggle.getAttribute('aria-expanded')!=='true')mainToggle.click();open(sample,'click')});refresh();
})();
