/* Shared, progressively enhanced homepage carousel. No external library or request. */
(() => {
  'use strict';
  document.querySelectorAll('[data-hero-carousel]').forEach(root => {
    const slides = [...root.querySelectorAll('.ss-hero-slide')];
    const controls = root.querySelector('.ss-hero-controls');
    if (slides.length < 2 || !controls) return;
    const zh = document.documentElement.lang.toLowerCase().startsWith('zh');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const duration = Number(root.dataset.interval) || 6000;
    const dots = [...controls.querySelectorAll('[data-hero-go]')];
    const pause = controls.querySelector('[data-hero-toggle]');
    const progress = controls.querySelector('.ss-hero-progress-value');
    const counter = controls.querySelector('[data-hero-counter]');
    const topic = controls.querySelector('[data-hero-topic]');
    const live = controls.querySelector('[data-hero-status]');
    let current = Math.min(slides.length - 1, Math.max(0, (Number.parseInt(new URL(location.href).searchParams.get('slide'), 10) || 1) - 1));
    let userPaused = reduced.matches, pointerInside = false, focusInside = false, inView = true;
    let timer = 0, started = 0, remaining = duration, frame = 0, touch = null, swipedAt = 0;
    function permitted() { return !userPaused && !pointerInside && !focusInside && !document.hidden && inView; }
    function stopTimer(reset = false) {
      if (timer) { clearTimeout(timer); timer = 0; remaining = Math.max(0, remaining - (performance.now() - started)); }
      cancelAnimationFrame(frame);
      if (reset) remaining = duration;
      progress.style.transition = 'none';
      progress.style.transform = 'scaleX(' + (1 - remaining / duration) + ')';
    }
    function sync() {
      stopTimer();
      const running = permitted();
      root.dataset.autoplay = running ? 'playing' : 'paused';
      const label = userPaused ? (zh ? '开始自动轮播' : 'Start automatic slideshow') : (zh ? '暂停自动轮播' : 'Pause automatic slideshow');
      pause.setAttribute('aria-label', label); pause.title = label;
      pause.dataset.paused = String(userPaused);
      controls.querySelector('[data-hero-play-state]').textContent = running ? (zh ? '自动播放' : 'Auto play') : (zh ? '已暂停' : 'Paused');
      if (!running) return;
      started = performance.now();
      frame = requestAnimationFrame(() => {
        if (!permitted()) return;
        progress.style.transition = 'transform ' + remaining + 'ms linear';
        progress.style.transform = 'scaleX(1)';
      });
      timer = setTimeout(() => { timer = 0; go(current + 1, false); }, Math.max(30, remaining));
    }
    function go(index, announce = true) {
      stopTimer(true);
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.inert = !active;
      });
      dots.forEach((dot, i) => { dot.setAttribute('aria-pressed', String(i === current)); });
      counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
      topic.textContent = slides[current].dataset.slideLabel;
      root.dataset.currentSlide = String(current + 1);
      if (announce) live.textContent = (zh ? '第 ' + (current + 1) + ' 张，共 ' + slides.length + ' 张：' : 'Slide ' + (current + 1) + ' of ' + slides.length + ': ') + topic.textContent;
      sync();
    }
    controls.querySelector('[data-hero-prev]').addEventListener('click', () => go(current - 1));
    controls.querySelector('[data-hero-next]').addEventListener('click', () => go(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));
    pause.addEventListener('click', () => {
      userPaused = !userPaused;
      if (!userPaused) { remaining = duration; focusInside = false; }
      live.textContent = userPaused ? (zh ? '自动轮播已暂停。' : 'Automatic slideshow paused.') : (zh ? '自动轮播已开启。鼠标移出后播放。' : 'Automatic slideshow enabled. Move the pointer away to play.');
      sync();
    });
    controls.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); go(current + (e.key === 'ArrowLeft' ? -1 : 1)); }
    });
    root.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { pointerInside = true; sync(); } });
    root.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { pointerInside = false; sync(); } });
    root.addEventListener('focusin', e => { if (!e.target.matches(':focus-visible')) return; focusInside = true; sync(); });
    root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget)) { focusInside = false; sync(); } });
    const track = root.querySelector('.ss-hero-track');
    track.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') touch = {x:e.clientX, y:e.clientY, id:e.pointerId}; });
    track.addEventListener('pointercancel', () => { touch = null; });
    track.addEventListener('pointerup', e => {
      if (!touch || touch.id !== e.pointerId) return;
      const dx = e.clientX - touch.x, dy = e.clientY - touch.y; touch = null;
      if (Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.35) { swipedAt = performance.now(); go(current + (dx < 0 ? 1 : -1)); }
    });
    track.addEventListener('click', e => { if (swipedAt && performance.now() - swipedAt < 600) { e.preventDefault(); e.stopPropagation(); } }, true);
    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting && entries[0].intersectionRatio > .15; sync();
    }, {threshold:[0,.15,.3]}).observe(root);
    reduced.addEventListener?.('change', () => { if (reduced.matches) userPaused = true; sync(); });
    controls.hidden = false;
    root.classList.add('ss-hero-ready');
    go(current, false);
  });
})();
