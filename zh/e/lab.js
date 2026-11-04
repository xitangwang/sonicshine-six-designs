'use strict';
(()=>{
const $=(s,r=document)=>r.querySelector(s),all=(s,r=document)=>[...r.querySelectorAll(s)];
const menu=$('.menu'),nav=$('#main-nav');
if(menu){const close=()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='菜单'};menu.addEventListener('click',()=>{let open=!nav.classList.contains('open');nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'关闭':'菜单'});document.addEventListener('click',e=>{if(!e.target.closest('.navrow'))close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){close();menu.focus()}});window.matchMedia('(min-width:711px)').addEventListener?.('change',e=>{if(e.matches)close()})}
if(!$('#lab-interface'))return;
const goals=[["film", "A", "可见油膜", "外表面", "明确要检查的具体外表面及其范围。", "依照约定的光照、角度及搬运条件，在试洗前后拍摄同一块区域。", "与采购方商定参考外观或检验方法。仅凭照片未必能够判断油残留是否符合限值。"], ["bore", "B", "盲孔残留", "凹入部位", "在工件图纸上标出孔口及关注的内部特征。", "记录来料残留情况，以及试洗后观察同一特征的约定方法，并注明可达范围。", "约定无法直接观察的部位如何核验，以及什么证据可以判定合格。单凭外观照片不足以判定。"], ["rinse", "C", "漂洗痕迹", "干燥边缘", "找出工件离开料篮时漂洗液可能积聚的边缘或凹腔。", "记录工件朝向和干燥条件，在相同的约定观察间隔后对比同一区域。", "在规定光照下商定参考状态，并明确痕迹影响外观、功能，还是两者都影响。"], ["finish", "D", "表面保护", "精加工配合面", "标出必须保持原状的涂层面、抛光面或配合面。", "记录参考面、观察角度和光照。分别标记试洗件与对照件。", "针对该表面约定允许的变化和停止试验的条件，并在处理前评审验收方法。"]];const byKey=new Map(goals.map(r=>[r[0],r]));const tabs=all('[data-goal]'),marks=all('[data-mark]');let active='film',selected=[];
try{const saved=JSON.parse(sessionStorage.getItem('sonicshine-surface-lab-v1')||'[]');if(Array.isArray(saved))selected=[...new Set(saved.filter(x=>byKey.has(x)))];}catch(e){}
function store(){try{sessionStorage.setItem('sonicshine-surface-lab-v1',JSON.stringify(selected))}catch(e){}}
function sync(){const r=byKey.get(active),has=selected.includes(active),n=selected.length;
 tabs.forEach(b=>{const a=b.dataset.goal===active;b.tabIndex=a?0:-1;b.setAttribute('aria-selected',String(a))});marks.forEach(m=>m.classList.toggle('active',m.dataset.mark===active));
 $('#observation').setAttribute('aria-labelledby','goal-'+active);$('#lab-code').textContent='检查 '+r[1]+' / '+r[2];$('#art-label').textContent=r[1]+' / '+r[3];$('#lab-title').textContent=r[3];$('#lab-where').textContent=r[4];$('#lab-record').textContent=r[5];$('#lab-accept').textContent=r[6];
 const toggle=$('#toggle-check');toggle.setAttribute('aria-pressed',String(has));toggle.textContent=has?'− 移除此项':'＋ 加入此项';
 $('#check-count').textContent='我的核验清单 · '+n+' 项';
 $('#check-help').textContent=n?'已选验收条件将随项目询盘一并带入。':'添加需要评审的条件。发起询盘前，随时可以移除。';
 const list=$('#check-list');list.replaceChildren();selected.forEach(k=>{const item=byKey.get(k),li=document.createElement('li'),remove=document.createElement('button');remove.type='button';remove.textContent=item[1]+' · '+item[2]+' ×';remove.setAttribute('aria-label','从清单中移除：'+item[2]);remove.addEventListener('click',()=>{selected=selected.filter(x=>x!==k);store();sync();$('#toggle-check').focus({preventScroll:true});$('#lab-ann').textContent=item[2]+'已移除。'});li.append(remove);list.append(li)});
 const send=$('#send-checks');send.disabled=!n;send.textContent=n?'携 '+n+' 项核验条件询盘 ↗':'带上清单询盘 ↗';send.dataset.inquire=['洁净实验室 — 验收清单','仅供项目前期规划；以下条件需与工程及质量团队共同商定。','',...selected.flatMap(k=>{const x=byKey.get(k);return ['检查 '+x[1]+': '+x[2]+' — '+x[3],'检查部位：'+x[4],'记录方式：'+x[5],'待商定的验收条件：'+x[6],'']})].join('\n').trim();
}
function select(k,focus=false){active=k;sync();if(focus)$('#goal-'+k).focus()}
tabs.forEach((b,i)=>{b.addEventListener('click',()=>select(b.dataset.goal));b.addEventListener('keydown',e=>{let pos={ArrowRight:(i+1)%tabs.length,ArrowLeft:(i+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1}[e.key];if(pos!=null){e.preventDefault();select(tabs[pos].dataset.goal,true)}})});
$('#toggle-check').addEventListener('click',()=>{const has=selected.includes(active);selected=has?selected.filter(k=>k!==active):[...selected,active];store();sync();$('#lab-ann').textContent=byKey.get(active)[2]+(has?'已从清单移除。':'已加入清单。')});
sync();
})();
