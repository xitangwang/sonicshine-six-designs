'use strict';
(() => {
 const menu=document.querySelector('.f-menu'),nav=document.querySelector('.f-nav');
 if(menu&&nav){
  function close(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.querySelector('span').textContent='菜单';}
  menu.addEventListener('click',()=>{if(nav.classList.contains('open')){close();return;}nav.classList.add('open');menu.setAttribute('aria-expanded','true');menu.querySelector('span').textContent='关闭';});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){close();menu.focus();}});
  window.matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches)close();});
 }
 const board=document.querySelector('[data-f-planner]');if(!board)return;
 const tabs=[...board.querySelectorAll('[role=tab]')],panels=[...board.querySelectorAll('[role=tabpanel]')],checks=[...board.querySelectorAll('[data-agitem]')],count=board.querySelector('.f-count'),status=board.querySelector('.f-status'),out=board.querySelector('.f-agendaout'),body=out.querySelector('[data-agenda-body]'),pass=out.querySelector('[data-inquire]'),key='ss-project-partners-agenda-v1';
 let generated='',active=tabs[0].dataset.stage;
 function read(){try{return JSON.parse(sessionStorage.getItem(key)||'[]')}catch(_){return[]}}
 const remembered=read();if(Array.isArray(remembered))checks.forEach(c=>c.checked=remembered.includes(c.value));
 function save(){try{sessionStorage.setItem(key,JSON.stringify(checks.filter(c=>c.checked).map(c=>c.value)))}catch(_){}}
 function update(){const n=checks.filter(c=>c.checked).length;count.textContent='已选 '+n+' 项';out.hidden=true;generated='';status.textContent='';}
 function stage(id,focus){const t=tabs.find(x=>x.dataset.stage===id);if(!t)return;active=id;tabs.forEach(x=>{x.setAttribute('aria-selected',String(x===t));x.tabIndex=x===t?0:-1});panels.forEach(p=>p.hidden=p.dataset.stage!==id);if(focus)t.focus();}
 function navigate(id){if(id!==active&&generated){out.hidden=true;generated='';status.textContent='请重新生成议程，纳入当前项目阶段。';}stage(id,false);if(location.protocol!=='file:'){const u=new URL(location.href);u.searchParams.set('stage',id);history.replaceState(null,'',u);}}
 tabs.forEach((t,i)=>{t.addEventListener('click',()=>navigate(t.dataset.stage));t.addEventListener('keydown',e=>{const m={ArrowRight:(i+1)%tabs.length,ArrowLeft:(i+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1};if(e.key in m){e.preventDefault();const n=tabs[m[e.key]];navigate(n.dataset.stage);n.focus();}})});
 document.querySelectorAll('[data-open-stage]').forEach(a=>a.addEventListener('click',e=>{if(!board||!board.id)return;e.preventDefault();navigate(a.dataset.openStage);board.scrollIntoView({block:'start'});tabs.find(t=>t.dataset.stage===a.dataset.openStage)?.focus({preventScroll:true});}));
 board.addEventListener('change',e=>{if(!e.target.matches('[data-agitem]'))return;save();update()});
 board.querySelector('[data-agreset]').addEventListener('click',()=>{checks.forEach(c=>c.checked=false);save();update();status.textContent='已清空所选议题。'});
 board.querySelector('[data-agbuild]').addEventListener('click',()=>{const take=checks.filter(c=>c.checked);if(!take.length){update();status.textContent='请至少勾选一个事项，再生成议程。';return;}
  const focusLabel=tabs.find(t=>t.dataset.stage===active).dataset.stageTitle;
  body.replaceChildren();const linkLines=['项目伙伴 · 采购讨论议程','当前项目阶段：'+focusLabel];const intro=document.createElement('p');intro.textContent='当前项目阶段：'+focusLabel+'。';body.appendChild(intro);
  tabs.forEach(t=>{const cells=take.filter(c=>c.dataset.agstage===t.dataset.stage);if(!cells.length)return;const h=document.createElement('h4');h.textContent=t.dataset.stageTitle;body.appendChild(h);const ul=document.createElement('ul');linkLines.push('',t.dataset.stageTitle+'：');cells.forEach(ch=>{const s=ch.dataset.agitem,li=document.createElement('li');li.textContent=s;ul.appendChild(li);linkLines.push('• '+s)});body.appendChild(ul);});
  generated=linkLines.join('\n');pass.dataset.inquire=generated;out.hidden=false;status.textContent='已生成议程，共 '+take.length+' 项。';out.querySelector('h3').focus({preventScroll:true});out.scrollIntoView({block:'nearest'});
 });
 out.querySelector('[data-agcopy]').addEventListener('click',async()=>{if(!generated)return;let ok=false;try{await navigator.clipboard.writeText(generated);ok=true}catch(_){const el=document.createElement('textarea');el.value=generated;el.setAttribute('aria-label','复制议程');el.style.position='fixed';el.style.left='-9999px';document.body.appendChild(el);el.select();try{ok=document.execCommand('copy')}catch(_){}el.remove();}status.textContent=ok?'议程已复制。':'请选取并复制上方议程文字。';});
 const requested=new URLSearchParams(location.search).get('stage');stage(tabs.some(t=>t.dataset.stage===requested)?requested:active,false);update();
})();
