// GA4 event helper that safely no-ops when analytics is unavailable
function trackEvent(eventName, parameters) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, parameters || {});
  }
}

// Mobile navigation toggle
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!menuToggle || !navLinks) return;

  const setMenuState = (isOpen) => {
    navLinks.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  };

  menuToggle.addEventListener('click', () => {
    setMenuState(!navLinks.classList.contains('is-open'));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuState(false);
    }
  });

  document.addEventListener('click', (event) => {
    if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenuState(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      setMenuState(false);
    }
  });
}

// Smooth scrolling for in-page links
function initSmoothScrolling() {
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// Dark mode toggle with localStorage persistence
function initDarkMode() {
  const toggleButton = document.querySelector('.theme-toggle');
  if (!toggleButton) return;

  const savedTheme = localStorage.getItem('learnsphere-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    toggleButton.textContent = '☀️';
  }

  toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    toggleButton.textContent = isDark ? '☀️' : '🌙';
    toggleButton.setAttribute('aria-pressed', String(isDark));
    localStorage.setItem('learnsphere-theme', isDark ? 'dark' : 'light');
    trackEvent('dark_mode_toggle', { theme: isDark ? 'dark' : 'light' });
  });
}

// FAQ accordion behavior
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-list details');

  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;

      const summary = item.querySelector('summary');
      const faqTitle = summary ? summary.textContent.trim() : 'Unknown FAQ';

      trackEvent('faq_open', { faq_title: faqTitle });

      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.open = false;
        }
      });
    });
  });
}

// Animated statistics counters
function initCounters() {
  const counters = document.querySelectorAll('.stat-item strong');
  if (!counters.length) return;

  const animateCounter = (element) => {
    const targetText = element.textContent;
    const numericValue = parseInt(targetText.replace(/[^0-9]/g, ''), 10);
    if (Number.isNaN(numericValue)) return;

    let current = 0;
    const increment = Math.max(1, Math.ceil(numericValue / 60));
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        current = numericValue;
        clearInterval(timer);
      }
      element.textContent = targetText.replace(/\d+/g, current.toString());
    }, 30);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.7 });

  counters.forEach((counter) => observer.observe(counter));
}

// Testimonial slider
function initTestimonialSlider() {
  const slides = document.querySelectorAll('.testimonial-card');
  const prevButton = document.querySelector('.testimonial-controls button:first-child');
  const nextButton = document.querySelector('.testimonial-controls button:last-child');

  if (!slides.length || !prevButton || !nextButton) return;

  let currentIndex = 0;

  function showSlide(index) {
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === index;
      slide.hidden = !isActive;
      slide.setAttribute('aria-hidden', String(!isActive));
    });
  }

  function moveSlide(direction) {
    currentIndex = (currentIndex + direction + slides.length) % slides.length;
    showSlide(currentIndex);
  }

  showSlide(currentIndex);
  prevButton.addEventListener('click', () => {
    moveSlide(-1);
    trackEvent('testimonial_previous', { button_name: 'Previous' });
  });
  nextButton.addEventListener('click', () => {
    moveSlide(1);
    trackEvent('testimonial_next', { button_name: 'Next' });
  });
}

// Scroll-to-top button
function initScrollToTop() {
  const button = document.createElement('button');
  button.className = 'scroll-top';
  button.type = 'button';
  button.setAttribute('aria-label', 'Scroll to top');
  button.textContent = '↑';
  document.body.appendChild(button);

  window.addEventListener('scroll', () => {
    button.classList.toggle('show', window.scrollY > 500);
  });

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Form validation
function validateField(input) {
  if (!input) return true;
  if (input.type === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
  }
  return input.value.trim() !== '';
}

function initFormValidation() {
  const contactForm = document.querySelector('.contact-form');
  const newsletterForm = document.querySelector('.newsletter-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const inputs = contactForm.querySelectorAll('input, textarea');
      let isValid = true;

      inputs.forEach((input) => {
        const valid = validateField(input);
        input.setAttribute('aria-invalid', String(!valid));
        input.style.borderColor = valid ? '' : '#ef4444';
        if (!valid) {
          isValid = false;
        }
      });

      if (isValid) {
        trackEvent('contact_submit', { form_name: 'contact' });
        alert('Thanks for reaching out! We will get back to you soon.');
        contactForm.reset();
      }
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (!emailInput) return;

      const valid = validateField(emailInput);
      emailInput.setAttribute('aria-invalid', String(!valid));
      emailInput.style.borderColor = valid ? '' : '#ef4444';

      if (!valid) {
        alert('Please enter a valid email address.');
      } else {
        trackEvent('newsletter_signup', { form_name: 'newsletter' });
        alert('You are subscribed to our newsletter.');
        newsletterForm.reset();
      }
    });
  }
}

// Fade-in animations using Intersection Observer
function initFadeInAnimations() {
  const elements = document.querySelectorAll('.feature-card, .course-card, .pricing-card, .testimonial-card, .stat-item, .faq-list details');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in', 'is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach((element) => {
    element.classList.add('fade-in');
    observer.observe(element);
  });
}

// Lazy loading support for images and placeholders
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach((img) => observer.observe(img));
}

// Active navigation highlighting
function initActiveNavigation() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (!sections.length || !navLinks.length) return;

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const isActive = href === `#${id}`;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  }, { threshold: 0.4 });

  sections.forEach((section) => observer.observe(section));
}

// Track button interactions for analytics
function initAnalyticsEvents() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('a, button');
    if (!target) return;

    if (target.closest('.hero-actions .btn-primary')) {
      trackEvent('get_started_click', { button_name: 'Get Started' });
    }

    if (target.closest('.hero-actions .btn-secondary')) {
      trackEvent('watch_demo_click', { button_name: 'Watch Demo' });
    }

    if (target.closest('.course-card button')) {
      const courseCard = target.closest('.course-card');
      const courseName = courseCard ? courseCard.querySelector('h3')?.textContent.trim() : 'Unknown Course';
      trackEvent('enroll_click', { button_name: 'Enroll', course_name: courseName });
    }

    if (target.closest('.pricing-card button')) {
      const plan = target.textContent.replace(/Choose|Contact Sales/g, '').trim() || 'Unknown Plan';
      trackEvent('pricing_subscribe', { plan, button_name: target.textContent.trim() });
    }
  });
}

// Initialize all modules
function init() {
  initMobileMenu();
  initSmoothScrolling();
  initDarkMode();
  initFaqAccordion();
  initCounters();
  initTestimonialSlider();
  initScrollToTop();
  initFormValidation();
  initFadeInAnimations();
  initLazyLoading();
  initActiveNavigation();
  initAnalyticsEvents();
  trackEvent('page_loaded', { page_title: document.title });
}

document.addEventListener('DOMContentLoaded', init);
