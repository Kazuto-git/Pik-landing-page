/* ==========================================================
   ПИК — скрипты
   1. Плавный скролл к разделу (шаги — по центру экрана)
   2. Подсветка текущего раздела в боковой навигации
   3. Параллакс первого экрана
   4. Заглушки для ссылок без адреса
   5. Мобильное меню (бургер)
   6. Ширина полосы прокрутки для масштабирования вёрстки
   ========================================================== */

const sideNav = document.querySelector('.side-nav');
const sideLinks = [...sideNav.querySelectorAll('.side-nav__link')];
const sections = sideLinks.map((link) => document.querySelector(link.getAttribute('href')));


/* ---------- 4. Заглушки ---------- */
/* Ссылки с href="#" пока никуда не ведут: не даём странице прыгать наверх */
document.querySelectorAll('a[href="#"]').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});


/* ---------- 1. Скролл к якорю ---------- */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const id = link.getAttribute('href').slice(1);
  const target = id && document.getElementById(id);

  if (!target) return;

  link.addEventListener('click', (event) => {
    event.preventDefault();
    target.scrollIntoView({
      behavior: 'smooth',
      block: id === 'start' ? 'start' : 'center',
    });
  });
});


/* ---------- 2. Текущий раздел ---------- */
function setActive(index) {
  sideNav.style.setProperty('--active-index', index);

  sideLinks.forEach((link, i) => {
    const isActive = i === index;
    link.classList.toggle('side-nav__link--active', isActive);
    isActive ? link.setAttribute('aria-current', 'true') : link.removeAttribute('aria-current');
  });
}

/* Раздел считается текущим, когда пересекает середину экрана */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(sections.indexOf(entry.target));
    });
  },
  { rootMargin: '-50% 0px -50% 0px' }
);

sections.forEach((section) => observer.observe(section));


/* ---------- 3. Параллакс ---------- */
/* Слои смещаются со скоростью data-parallax (доля от прокрутки) */
const parallaxLayers = document.querySelectorAll('[data-parallax]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let isTicking = false;

function updateParallax() {
  const offset = window.scrollY;

  parallaxLayers.forEach((layer) => {
    layer.style.transform = `translate3d(0, ${offset * layer.dataset.parallax}px, 0)`;
  });

  isTicking = false;
}

/* На планшетах и телефонах параллакс отключён (без лишней нагрузки) */
const isCompact = window.matchMedia('(max-width: 1199px)');

if (!reduceMotion.matches && !isCompact.matches) {
  window.addEventListener(
    'scroll',
    () => {
      if (!isTicking) {
        requestAnimationFrame(updateParallax);
        isTicking = true;
      }
    },
    { passive: true }
  );
}


/* ---------- 5. Мобильное меню ---------- */
const header = document.querySelector('.header');
const burger = header.querySelector('.header__burger');

function setMenu(isOpen) {
  header.classList.toggle('header--open', isOpen);
  document.body.classList.toggle('page--locked', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
  burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
}

burger.addEventListener('click', () => {
  setMenu(!header.classList.contains('header--open'));
});

header.querySelectorAll('.header__link').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

/* При переходе на десктопную ширину закрываем меню */
window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
  if (event.matches) setMenu(false);
});

/* iOS Safari применяет :active только при наличии touch-обработчика */
document.addEventListener('touchstart', () => {}, { passive: true });


/* ---------- 6. Ширина полосы прокрутки ---------- */
/* Нужна CSS-переменной --u, чтобы вёрстка масштабировалась точно по ширине окна */
function setScrollbarWidth() {
  const width = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--scrollbar', `${width}px`);
}

setScrollbarWidth();
window.addEventListener('resize', setScrollbarWidth);
