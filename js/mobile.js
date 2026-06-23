(function(){
  'use strict';

  document.addEventListener('DOMContentLoaded', function(){

    const hamburger  = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuClose  = document.getElementById('mobile-menu-close');
    const topBar     = document.querySelector('.top-bar');

    /* Scroll-reveal header */
    window.addEventListener('scroll', () => {
      if (!topBar) return;
      topBar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    if (!hamburger || !mobileMenu) return;

    function openMenu() {
      mobileMenu.classList.add('open');
      hamburger.classList.add('open');
      topBar?.classList.add('scrolled');
      window.lenis?.stop?.();
    }

    function closeMenu() {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      window.lenis?.start?.();
    }

    hamburger.addEventListener('click', openMenu);
    menuClose?.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(l => l.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(l.getAttribute('href'));
      closeMenu();              /* removes .open and restarts Lenis */
      if (target) {
        /* Wait for Lenis to resume before scrolling (it was stopped while the menu was open) */
        requestAnimationFrame(() => {
          if (window.lenis?.scrollTo) {
            window.lenis.scrollTo(target, { offset: 0, duration: 1.6 });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
    }));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });

  });
})();