'use strict';
(() => {
  const menu = document.querySelector('.menu-toggle'), nav = document.getElementById('headnav');
  if (menu && nav) {
    const shut = () => {nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.querySelector('span').textContent='Menu';};
    menu.addEventListener('click', () => {const open = !nav.classList.contains('open');if(!open){shut();return;}nav.classList.add('open');menu.setAttribute('aria-expanded','true');menu.querySelector('span').textContent='Close';});
    document.addEventListener('keydown', e => {if(e.key==='Escape' && nav.classList.contains('open')){shut();menu.focus();}});
    window.matchMedia('(min-width: 751px)').addEventListener('change', e => {if(e.matches)shut();});
  }
  const filter = document.querySelector('[data-filters]');
  if(filter){
    const work=filter.querySelector('#workpiece'),soil=filter.querySelector('#soil'),status=filter.querySelector('[role=status]'),entries=[...document.querySelectorAll('[data-record]')],empty=document.querySelector('.empty'),params=new URLSearchParams(location.search);
    function preset(select,name){let val=params.get(name);if(val && [...select.options].some(o=>o.value===val))select.value=val;}
    preset(work,'workpiece');preset(soil,'soil');
    function apply(write){let n=0;entries.forEach(row=>{row.hidden=!!((work.value&&row.dataset.work!==work.value)||(soil.value&&row.dataset.soil!==soil.value));if(!row.hidden)n++;});status.textContent=n+' of '+entries.length+' files';empty.hidden=!!n;
      if(write && location.protocol !== 'file:'){const u=new URL(location.href);work.value?u.searchParams.set('workpiece',work.value):u.searchParams.delete('workpiece');soil.value?u.searchParams.set('soil',soil.value):u.searchParams.delete('soil');history.replaceState({},'',u);}
    }
    filter.addEventListener('change',()=>apply(true));filter.querySelector('[data-reset]').addEventListener('click',()=>{work.value='';soil.value='';apply(true);});apply(false);
  }
  document.querySelectorAll('.steptabs').forEach(nav=>{
    const tabs=[...nav.querySelectorAll('button[role=tab]')],region=nav.closest('.process');
    function choose(tab,focus){tabs.forEach(t=>{const on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;region.querySelector('#'+t.getAttribute('aria-controls')).hidden=!on;});if(focus)tab.focus();}
    tabs.forEach((t,i)=>{t.addEventListener('click',()=>choose(t,false));t.addEventListener('keydown',e=>{const selects={ArrowRight:(i+1)%tabs.length,ArrowLeft:(i+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1};if(e.key in selects){e.preventDefault();choose(tabs[selects[e.key]],true);}});});if(tabs[0])choose(tabs[0],false);
  });
  document.querySelectorAll('[data-news-filter]').forEach(btn=>btn.addEventListener('click',()=>{const category=btn.dataset.newsFilter;document.querySelectorAll('[data-news-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));document.querySelectorAll('[data-newscat]').forEach(row=>row.hidden=category!=='all'&&row.dataset.newscat!==category);const status=document.querySelector('#newsstatus');if(status)status.textContent=document.querySelectorAll('[data-newscat]:not([hidden])').length+' articles';}));
})(); 
