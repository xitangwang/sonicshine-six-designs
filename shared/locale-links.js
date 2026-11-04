/* Keep the current section and URL-based configuration when changing editions.
   A locale is a real HTML document; no runtime text replacement or service is used. */
(()=>{const same=new URL(location.href), key='sonic-shine-published-language';const save=lang=>{try{localStorage.setItem(key,lang)}catch{}};
document.querySelectorAll('a[data-ss-edition]').forEach(a=>{const u=new URL(a.getAttribute('href'),location.href);u.search=same.search;u.hash=same.hash;a.href=u.href;a.addEventListener('click',()=>save(a.dataset.ssEdition))});
save(document.documentElement.lang==='zh-CN'?'zh-CN':'en');})();
