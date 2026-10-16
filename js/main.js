/**
 * Azizkhon — main.js
 * ======================================================
 * - Плавная прокрутка по якорям
 * - Мобильное меню (бургер)
 * - Тень шапки при прокрутке
 * - Scroll-reveal анимации
 * - Анимация progress-баров
 * - Обработка формы заявки → WhatsApp redirect
 * ======================================================
 */

// ==========================================
// 1. КОНФИГУРАЦИЯ
// ==========================================

/**
 * Укажите номер WhatsApp мастера в международном формате.
 * Только цифры: код страны + номер.
 * Пример: '77001234567'  (Казахстан, +7 700 123-45-67)
 */
const WHATSAPP_NUMBER = '77016202745'; // <-- ЗАМЕНИТЕ НА РЕАЛЬНЫЙ НОМЕР

// ==========================================
// 2. ИНИЦИАЛИЗАЦИЯ
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
  initStickyHeader();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initStatBars();
  initOrderForm();
});

// ==========================================
// 3. ЛИПКАЯ ШАПКА (тень при прокрутке)
// ==========================================
function initStickyHeader() {
  var header = document.getElementById('site-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ==========================================
// 4. МОБИЛЬНОЕ МЕНЮ
// ==========================================
function initMobileMenu() {
  var burger = document.getElementById('nav-burger');
  var mobileMenu = document.getElementById('mobile-menu');
  if (!burger || !mobileMenu) return;

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    var spans = burger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  }

  burger.addEventListener('click', function () {
    var isOpen = mobileMenu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(isOpen));

    var spans = burger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      closeMobileMenu();
    }
  });

  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('click', function (e) {
    if (!mobileMenu.contains(e.target) && !burger.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

// ==========================================
// 5. ПЛАВНАЯ ПРОКРУТКА К СЕКЦИЯМ
// ==========================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href').slice(1);
      var target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      var headerOffset    = 72;
      var elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
      var offsetPosition  = elementPosition - headerOffset;

      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    });
  });
}

// ==========================================
// 6. SCROLL-REVEAL АНИМАЦИИ
// ==========================================
function initScrollReveal() {
  var elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  // Fallback: если IntersectionObserver недоступен — показать всё
  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.10,
    rootMargin: '0px 0px -30px 0px'
  });

  elements.forEach(function (el) { observer.observe(el); });
}

// ==========================================
// 7. АНИМАЦИЯ ПРОГРЕСС-БАРОВ
// ==========================================
function initStatBars() {
  var bars = document.querySelectorAll('.about-stat-fill');
  if (!bars.length) return;

  if (!('IntersectionObserver' in window)) {
    bars.forEach(function (bar) {
      bar.style.width = bar.getAttribute('data-width') || '0%';
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var bar = entry.target;
        var targetWidth = bar.getAttribute('data-width') || '0%';
        setTimeout(function () { bar.style.width = targetWidth; }, 200);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(function (bar) { observer.observe(bar); });
}

// ==========================================
// 8. ФОРМА ЗАЯВКИ → WHATSAPP
// ==========================================
function initOrderForm() {
  var form = document.getElementById('order-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name    = getVal('field-name');
    var phone   = getVal('field-phone');
    var service = getVal('field-service');
    var problem = getVal('field-problem');

    if (!name || !phone) {
      showFormError('Пожалуйста, укажите ваше имя и номер телефона.');
      return;
    }

    var lines = [
      '\uD83D\uDCCB *Новая заявка с сайта Azizkhon*',
      '',
      '\uD83D\uDC64 *Имя:* ' + name,
      '\uD83D\uDCDE *Телефон:* ' + phone,
      '\uD83D\uDD27 *Услуга / Устройство:* ' + (service || 'Не указано'),
      '\uD83D\uDCDD *Описание проблемы:* ' + (problem || 'Не указано')
    ];

    var message = lines.join('\n');
    var encoded = encodeURIComponent(message);
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encoded;

    var btn = form.querySelector('.form-submit');
    var originalText = btn.textContent;
    btn.textContent = 'Переадресация в WhatsApp…';
    btn.disabled = true;

    setTimeout(function () {
      window.open(url, '_blank', 'noopener,noreferrer');
      btn.textContent = originalText;
      btn.disabled = false;
      form.reset();
    }, 400);
  });
}

function getVal(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function showFormError(msg) {
  var errorEl = document.getElementById('form-error');
  if (!errorEl) {
    errorEl = document.createElement('p');
    errorEl.id = 'form-error';
    errorEl.style.cssText = 'color:#c0392b;font-size:.82rem;margin-top:.5rem;font-weight:500;';
    var form = document.getElementById('order-form');
    var submitBtn = form.querySelector('.form-submit');
    form.insertBefore(errorEl, submitBtn);
  }
  errorEl.textContent = msg;
  setTimeout(function () { errorEl.textContent = ''; }, 4000);
}
