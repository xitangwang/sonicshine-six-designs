'use strict';
(() => {
const q=(s,root=document)=>root.querySelector(s), qa=(s,root=document)=>[...root.querySelectorAll(s)];
const menu=q('.menu-toggle'),nav=q('#main-nav');
if(menu){const close=()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Menu'};menu.addEventListener('click',()=>{let open=!nav.classList.contains('open');nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close':'Menu'});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){close();menu.focus()}});window.matchMedia('(min-width:761px)').addEventListener?.('change',e=>{if(e.matches)close()});document.addEventListener('click',e=>{if(!e.target.closest('.site-head'))close()})}
const stages=[['Fixture & orientation','Check how the basket holds the part and gives blind holes a drainage path.'],['Ultrasonic cleaning','Use a representative part to compare residue removal with the original finish.'],['Carryover control','Check what the part carries out of the wash and whether another rinse is needed.'],['Dry-off & inspection','Inspect recesses and threads for retained liquid before agreeing a drying method.']];
const tabs=qa('[data-stage]');
const activate=(n,focus=false)=>{tabs.forEach((b,i)=>{b.tabIndex=i===n?0:-1;b.setAttribute('aria-selected',String(i===n))});q('#stage-count').textContent='Stage 0'+(n+1)+' / 04';q('#stage-name').textContent=stages[n][0];q('#stage-detail').textContent=stages[n][1];q('#process-panel').setAttribute('aria-labelledby',tabs[n].id);if(focus)tabs[n].focus()};
tabs.forEach((b,n)=>{b.addEventListener('click',()=>activate(n));b.addEventListener('keydown',e=>{let v={ArrowLeft:(n+3)%4,ArrowRight:(n+1)%4,Home:0,End:3}[e.key];if(v!==undefined){e.preventDefault();activate(v,true)}})});
const filters=qa('[data-filter]');filters.forEach(btn=>btn.addEventListener('click',()=>{const kind=btn.dataset.filter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));let count=0;qa('[data-kind]').forEach(row=>{row.hidden=kind!=='All'&&row.dataset.kind!==kind;if(!row.hidden)count++});q('#filter-status').textContent=count+' resources shown.'}));
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
'Machined housing':'Mark the pockets and blind features; check how the housing drains in its fixture.',
'Turned shaft':'Separate the finished surfaces and record the bearing points on the basket.',
'Hydraulic manifold':'Mark intersecting passages, inlets and outlets; agree how retained particles will be inspected.',
'Precision assembly':'Identify protected surfaces, joints and seals. Review compatibility before processing a sample.',
'Other / not sure':'Provide a sketch or two photos so engineering can identify difficult features and support points.'};
const residue={
'Machining oil':'Explore a wash followed by a rinse, then check for a remaining film against an agreed reference.',
'Loose particles / chips':'Discuss a particle-removal and rinse trial; define a repeatable way to check the hardest passage.',
'Polishing compound':'Check the deepest residue pockets in a representative sample and compare the surface with an untouched reference.',
'Mixed / unknown':'Identify the residue first. Select a trial sequence only after the residue and material are understood.'};
const material={
'Aluminium':'Confirm alloy, finish and any sensitivity to discoloration before agreeing chemistry.',
'Stainless steel':'Confirm grade, surface finish and any restrictions from the next production step.',
'Carbon steel':'Review corrosion sensitivity, drying and the interval before the next operation.',
'Other / not sure':'Confirm the substrate and coatings before choosing bath chemistry or operating settings.'};
function result(){const d=read();const rows=[['Starting point',source],['Workpiece',d.geometry+' · '+d.material],['Primary residue',d.residue],['Part envelope',d.dims?d.dims+' mm':'To be measured'],['Output target',d.rate?d.rate+' parts/hour':'To be agreed']];const steps=[['01 / Fixture',geometry[d.geometry]],['02 / Trial route',residue[d.residue]],['03 / Confirmation',material[d.material]+' Agree the acceptance check, basket load and handling method with an engineer.']];q('#brief-result').innerHTML='<dl class="facts">'+rows.map(([k,v])=>'<div class="fact"><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl><div class="step-summary"><span class="review-tag">Illustrative route · pending engineering review</span>'+steps.map(([k,v])=>'<div class="work-note"><span class="tiny">'+k.split(' / ')[0]+'</span><div><strong>'+k.split(' / ')[1]+'</strong><p>'+esc(v)+'</p></div></div>').join('')+'</div>';q('#handoff').dataset.inquire=['Process Studio — Trial brief',...rows.map(([k,v])=>k+': '+v),'Illustrative starting route; engineering confirmation required.',...steps.map(([k,v])=>k+': '+v)].join('\n')}
const example={material:'Aluminium',geometry:'Hydraulic manifold',residue:'Machining oil',dims:'180 × 90 × 65',rate:'40'};
q('#load-example').addEventListener('click',()=>{set(example);save();err.textContent='';q('#example-status').textContent='Example loaded. All values are illustrative and can be edited.'});
q('#next-1').addEventListener('click',()=>{const d=read();if(!d.material){return warning('Choose a material, or select “Other / not sure”.',q('[name=material]'))}if(!d.geometry){return warning('Choose a workpiece geometry.',val('geometry'))}toStep(2)});
q('#next-2').addEventListener('click',()=>{const d=read();if(!d.residue)return warning('Choose a primary residue. If it is uncertain, select “Mixed / unknown”.',val('residue'));if(val('rate').validity.badInput||(d.rate&&(!Number.isInteger(+d.rate)||+d.rate<1)))return warning('Enter a positive whole number for target output.',val('rate'));if(!d.dims&&!d.rate&&!d.unknown)return warning('Enter a part envelope or an output target, or mark both as unknown.',val('dims'));toStep(3)});
qa('[data-back]').forEach(b=>b.addEventListener('click',()=>toStep(+b.dataset.back)));
q('#brief-panel').addEventListener('input',e=>{if(e.target===val('unknown')&&val('unknown').checked){val('dims').value='';val('rate').value=''}else if(e.target===val('dims')||e.target===val('rate'))val('unknown').checked=false;err.textContent='';save()});
let saved;try{saved=JSON.parse(sessionStorage.getItem(storekey)||'null')}catch(e){}
if(saved?.data){set(saved.data);let n=saved.current===3&&firstOk(read())&&secondOk(read())?3:saved.current>=2&&firstOk(read())?2:1;toStep(n,false)}else if(route==='manifold-case'){set({...example,dims:'',rate:''})}else if(route==='shafts-case'){set({material:'Carbon steel',geometry:'Turned shaft',residue:'Machining oil'})}else if(route==='machined'){set({geometry:'Machined housing'})}else if(route==='automotive'){set({geometry:'Hydraulic manifold'})}else if(route==='precision'){set({geometry:'Precision assembly'})}
})();
