'use strict';
(() => {
const q=(s,root=document)=>root.querySelector(s), qa=(s,root=document)=>[...root.querySelectorAll(s)];
const menu=q('.menu-toggle'),nav=q('#main-nav');
if(menu){const close=()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='菜单'};menu.addEventListener('click',()=>{let open=!nav.classList.contains('open');nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'关闭':'菜单'});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){close();menu.focus()}});window.matchMedia('(min-width:761px)').addEventListener?.('change',e=>{if(e.matches)close()});document.addEventListener('click',e=>{if(!e.target.closest('.site-head'))close()})}
const stages=[['夹具与朝向','确认料篮怎样支承工件，以及盲孔内的积液能否排出。'],['超声波清洗','用有代表性的工件检查残留物是否去除，并与原有表面状态对照。'],['减少槽液带出','核对工件从清洗槽带出哪些物质，并评估是否需要增加一道漂洗。'],['干燥与检查','确定干燥方式前，检查凹腔和螺纹中是否留有积液。']];
const tabs=qa('[data-stage]');
const activate=(n,focus=false)=>{tabs.forEach((b,i)=>{b.tabIndex=i===n?0:-1;b.setAttribute('aria-selected',String(i===n))});q('#stage-count').textContent='工序 0'+(n+1)+' / 04';q('#stage-name').textContent=stages[n][0];q('#stage-detail').textContent=stages[n][1];q('#process-panel').setAttribute('aria-labelledby',tabs[n].id);if(focus)tabs[n].focus()};
tabs.forEach((b,n)=>{b.addEventListener('click',()=>activate(n));b.addEventListener('keydown',e=>{let v={ArrowLeft:(n+3)%4,ArrowRight:(n+1)%4,Home:0,End:3}[e.key];if(v!==undefined){e.preventDefault();activate(v,true)}})});
const filters=qa('[data-filter]');filters.forEach(btn=>btn.addEventListener('click',()=>{const kind=btn.dataset.filter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));let count=0;qa('[data-kind]').forEach(row=>{row.hidden=kind!=='All'&&row.dataset.kind!==kind;if(!row.hidden)count++});q('#filter-status').textContent='当前显示 '+count+' 份资料。'}));
if(!q('#brief-panel'))return;
const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stepAside=qa('.meter-list li'), pan=qa('[data-panel]'),vals=id=>q('#'+id).value.trim(),val=id=>q('#'+id),err=q('#brief-error');
const routes={'single-stage':'Single-stage systems','multi-stage':'Multi-stage cleaning lines','handling':'Handling & transfer','machined':'Machined parts','automotive':'Automotive components','precision':'Precision assemblies','manifold-case':'Illustrative manifold project','shafts-case':'Illustrative shaft-basket project'};
const route=new URLSearchParams(location.search).get('route')||'',source=routes[route]||'Workpiece planning';
let current=1;const read=()=>({material:q('input[name=material]:checked')?.value||'',geometry:vals('geometry'),residue:vals('residue'),dims:vals('dims'),rate:vals('rate'),unknown:val('unknown').checked});
const set=(obj)=>{qa('[name=material]').forEach(r=>r.checked=r.value===obj.material);['geometry','residue','dims','rate'].forEach(id=>val(id).value=obj[id]||'');val('unknown').checked=!!obj.unknown};
let storekey='sonic-shine-process-studio-v1:'+source;
const save=()=>{try{sessionStorage.setItem(storekey,JSON.stringify({data:read(),current}))}catch(e){}};
const firstOk=d=>d.material&&d.geometry;
const secondOk=d=>d.residue&&(d.dims||d.rate||d.unknown)&&(!d.rate||(+d.rate>=1&&Number.isInteger(+d.rate)));
const toStep=(n,focus=true)=>{err.textContent='';current=n;pan.forEach(el=>el.hidden=+el.dataset.panel!==n);stepAside.forEach((el,i)=>{if(i===n-1)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current')});if(n===3)result();save();if(focus){const panel=pan[n-1];q('h2',panel).focus({preventScroll:true});q('#brief-panel').scrollIntoView({block:'start',behavior:'instant'})}};
const warning=(s,el)=>{err.textContent=s;if(el)el.focus()};
const geometry={
'Machined housing':'标出凹腔和不通孔，核对壳体在夹具中的排液路径。',
'Turned shaft':'将精加工面彼此隔开，记录料篮与轴件的支承点。',
'Hydraulic manifold':'标出交叉孔道及进出口，约定如何检查里面滞留的颗粒。',
'Precision assembly':'标出需保护的表面、接合处和密封件，处理样件前先评估相容性。',
'Other / not sure':'提供简图或两张照片，帮助工程师识别难洗部位和支承点。'};
const residue={
'Machining oil':'讨论先清洗、再漂洗的试验，并按约定参考样检查是否有残余油膜。',
'Loose particles / chips':'讨论除颗粒和漂洗试验，为最难的孔道确定可重复的检查方法。',
'Polishing compound':'检查代表性样件最深的积污位置，并与未经处理的参考面对照。',
'Mixed / unknown':'先识别残留物，待明确残留物和基材后再选择试洗顺序。'};
const material={
'Aluminium':'确定清洗介质前，确认合金、表面状态及变色敏感性。',
'Stainless steel':'确认材料牌号、表面状态及下一工序的限制条件。',
'Carbon steel':'评估腐蚀敏感性、干燥方式及进入下一工序前的停留时间。',
'Other / not sure':'选择槽液配方或运行参数前，先确认基材和涂层。'};
const zhValues={'Single-stage systems':'单工位清洗系统','Multi-stage cleaning lines':'多工位清洗线','Handling & transfer':'装载与转运','Machined parts':'机加工件','Automotive components':'汽车零部件','Precision assemblies':'精密组件','Illustrative manifold project':'歧管项目示例','Illustrative shaft-basket project':'整篮轴件项目示例','Workpiece planning':'工件工艺规划','Machined housing':'机加工壳体','Turned shaft':'车削轴件','Hydraulic manifold':'液压歧管','Precision assembly':'精密组件','Other / not sure':'其他 / 尚不确定','Machining oil':'机加工油','Loose particles / chips':'松散颗粒 / 切屑','Polishing compound':'抛光膏','Mixed / unknown':'混合残留物 / 尚不确定','Aluminium':'铝或铝合金','Stainless steel':'不锈钢','Carbon steel':'碳钢'};const zh=v=>zhValues[v]||'待确认';function result(){const d=read();const rows=[['需求来源',zh(source)],['工件',zh(d.geometry)+' · '+zh(d.material)],['主要残留物',zh(d.residue)],['工件外形尺寸',d.dims?d.dims+' 毫米':'待测量'],['目标产量',d.rate?d.rate+' 件/小时':'待商定']];const steps=[['01 / 装夹',geometry[d.geometry]],['02 / 试洗方向',residue[d.residue]],['03 / 待确认事项',material[d.material]+'请与工程师商定验收方法、料篮负载和搬运方式。']];q('#brief-result').innerHTML='<dl class="facts">'+rows.map(([k,v])=>'<div class="fact"><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl><div class="step-summary"><span class="review-tag">示例流程 · 待工程评审</span>'+steps.map(([k,v])=>'<div class="work-note"><span class="tiny">'+k.split(' / ')[0]+'</span><div><strong>'+k.split(' / ')[1]+'</strong><p>'+esc(v)+'</p></div></div>').join('')+'</div>';q('#handoff').dataset.inquire=['工艺工作台 — 试洗简报',...rows.map(([k,v])=>k+': '+v),'以下为初步工艺方向，须经工程确认。',...steps.map(([k,v])=>k+': '+v)].join('\n')}
const example={material:'Aluminium',geometry:'Hydraulic manifold',residue:'Machining oil',dims:'180 × 90 × 65',rate:'40'};
q('#load-example').addEventListener('click',()=>{set(example);save();err.textContent='';q('#example-status').textContent='已载入示例。所有数值仅用于演示，均可修改。'});
q('#next-1').addEventListener('click',()=>{const d=read();if(!d.material){return warning('请选择材料；尚未确定时，可选“其他 / 尚不确定”。',q('[name=material]'))}if(!d.geometry){return warning('请选择工件形态。',val('geometry'))}toStep(2)});
q('#next-2').addEventListener('click',()=>{const d=read();if(!d.residue)return warning('请选择主要残留物；不确定时，可选“混合残留物 / 尚不确定”。',val('residue'));if(val('rate').validity.badInput||(d.rate&&(!Number.isInteger(+d.rate)||+d.rate<1)))return warning('目标产量应为正整数。',val('rate'));if(!d.dims&&!d.rate&&!d.unknown)return warning('请填写工件尺寸或目标产量，也可勾选两项均待确认。',val('dims'));toStep(3)});
qa('[data-back]').forEach(b=>b.addEventListener('click',()=>toStep(+b.dataset.back)));
q('#brief-panel').addEventListener('input',e=>{if(e.target===val('unknown')&&val('unknown').checked){val('dims').value='';val('rate').value=''}else if(e.target===val('dims')||e.target===val('rate'))val('unknown').checked=false;err.textContent='';save()});
let saved;try{saved=JSON.parse(sessionStorage.getItem(storekey)||'null')}catch(e){}
if(saved?.data){set(saved.data);let n=saved.current===3&&firstOk(read())&&secondOk(read())?3:saved.current>=2&&firstOk(read())?2:1;toStep(n,false)}else if(route==='manifold-case'){set({...example,dims:'',rate:''})}else if(route==='shafts-case'){set({material:'Carbon steel',geometry:'Turned shaft',residue:'Machining oil'})}else if(route==='machined'){set({geometry:'Machined housing'})}else if(route==='automotive'){set({geometry:'Hydraulic manifold'})}else if(route==='precision'){set({geometry:'Precision assembly'})}
})();
