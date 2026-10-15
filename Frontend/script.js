// Initialize AOS Animations
AOS.init({
  duration: 800,
  easing: 'ease',
  once: true,
  offset: 100
});

// Main application initialization
document.addEventListener('DOMContentLoaded', function() {



  // Sticky Header
  initStickyHeader();

  // Floating Circle Animation
  initFloatingCircle();

    // Hamburger Menu
  initHamburgerMenu();

  // Skills Swiper initialization
  initSkillsSwiper();

  // Work Section Filter
  initWorkFilters();

  // Contact Form
  initContactForm();
});



// Contact Form functionality
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnArrow = submitBtn.querySelector('.btn-arrow');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Show loading state
      submitBtn.disabled = true;
      btnText.textContent = 'Sending...';
      btnArrow.style.opacity = '0.5';

      // Get form data
      const formData = new FormData(contactForm);

      // Add honeypot field to prevent spam
      formData.append('_gotcha', '');

      // Submit form using fetch
      console.log('Submitting form to:', contactForm.action);
      console.log('Form data:', Object.fromEntries(formData));

      // Log the actual form data being sent
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (response.ok) {
          // Show success notification
          showNotification();
          // Reset form
          contactForm.reset();
          // Reset floating labels
          resetFloatingLabels();
        } else {
          console.error('Response not ok:', response.status, response.statusText);
          throw new Error('Network response was not ok');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        // Show error notification
        showErrorNotification();
      })
      .finally(() => {
        // Reset button state
        submitBtn.disabled = false;
        btnText.textContent = 'Send Message';
        btnArrow.style.opacity = '1';
      });
    });

    // Add floating label functionality
    const inputs = contactForm.querySelectorAll('.form-input-simple, .form-textarea-simple');
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.parentNode.classList.add('focused');
      });

      input.addEventListener('blur', function() {
        if (!this.value) {
          this.parentNode.classList.remove('focused');
        }
      });

      // Check if input has value on load
      if (input.value) {
        input.parentNode.classList.add('focused');
      }
    });
  }
}

// Reset floating labels
function resetFloatingLabels() {
  const inputs = document.querySelectorAll('.form-input-simple, .form-textarea-simple');
  inputs.forEach(input => {
    input.parentNode.classList.remove('focused');
  });
}

// Show success notification
function showNotification() {
  const notification = document.getElementById('notification');
  if (notification) {
    // Reset to success state
    const notificationText = notification.querySelector('.notification-text h4');
    const notificationDesc = notification.querySelector('.notification-text p');
    const notificationIcon = notification.querySelector('.notification-icon');

    notificationText.textContent = 'Message Sent Successfully!';
    notificationDesc.textContent = 'Thank you for reaching out. I\'ll get back to you within 24 hours.';
    notificationIcon.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

    notification.classList.add('show');

    // Auto-hide after 5 seconds
    setTimeout(() => {
      closeNotification();
    }, 5000);
  }
}

// Show error notification
function showErrorNotification() {
  const notification = document.getElementById('notification');
  if (notification) {
    const notificationText = notification.querySelector('.notification-text h4');
    const notificationDesc = notification.querySelector('.notification-text p');
    const notificationIcon = notification.querySelector('.notification-icon');

    // Change to error state
    notificationText.textContent = 'Message Failed to Send';
    notificationDesc.textContent = 'Please try again or contact me directly via email.';
    notificationIcon.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

    notification.classList.add('show');

    // Auto-hide after 5 seconds
    setTimeout(() => {
      closeNotification();
      // Reset to success state
      notificationText.textContent = 'Message Sent Successfully!';
      notificationDesc.textContent = 'Thank you for reaching out. I\'ll get back to you within 24 hours.';
      notificationIcon.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    }, 5000);
  }
}

// Close notification
function closeNotification() {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.classList.remove('show');
  }
}



// Sticky Header functionality
function initStickyHeader() {
  const navbar = document.querySelector('.navbar');
  let lastScrollTop = 0;

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 100) {
      navbar.classList.add('-sticky');
    } else {
      navbar.classList.remove('-sticky');
    }

    lastScrollTop = scrollTop;
  });
}

// Floating Circle Animation
function initFloatingCircle() {
  const animation = document.querySelector('#circle-main');
  if (animation) {
    animation.addEventListener('animationend', () => {
      animation.classList.add('end');
    });
    console.log('animation end');
  }
}

// Hamburger Menu functionality
function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburger-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');

      // Prevent body scroll when menu is open
      if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });
  }
}


function initSkillsSwiper() {
  const swiperElement = document.querySelector('.skillsSwiper');

  if (!swiperElement) {
    console.warn('[Skills Swiper] Container not found.');
    return;
  }

  const slides = swiperElement.querySelectorAll(
    '.swiper-wrapper > .swiper-slide'
  );

  const totalSlides = slides.length;

  // Check how many slides are visible at the current viewport width.
  function getSlidesPerView() {
    if (window.innerWidth >= 1024) {
      return 'auto';
    }
    if (window.innerWidth >= 768) {
      return 2;
    }
    if (window.innerWidth >= 640) {
      return 1.5;
    }
    if (window.innerWidth >= 480) {
      return 1.2;
    }
    return 1;
  }

  function canLoop() {
    const visibleSlides = getSlidesPerView();

    // Conservative threshold for stable looping.
    if (visibleSlides === 'auto') {
      return totalSlides >= 4;
    }

    return totalSlides >= Math.ceil(visibleSlides) + 1;
  }

  const skillsSwiper = new Swiper('.skillsSwiper', {
    slidesPerView: 'auto',
    slidesPerGroup: 1,
    spaceBetween: 30,
    centeredSlides: true,

    // Enable looping only when enough slides exist.
    loop: true,


    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },

    navigation: {
      nextEl: '.skills-button-next',
      prevEl: '.skills-button-prev',
    },

    pagination: {
      el: '.skills-pagination',
      clickable: true,
      dynamicBullets: true,
    },

    breakpoints: {
      320: {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 15,
        centeredSlides: true,
      },
      480: {
        slidesPerView: 1.2,
        slidesPerGroup: 1,
        spaceBetween: 15,
        centeredSlides: true,
      },
      640: {
        slidesPerView: 1.5,
        slidesPerGroup: 1,
        spaceBetween: 20,
        centeredSlides: true,
      },
      768: {
        slidesPerView: 2,
        slidesPerGroup: 1,
        spaceBetween: 25,
        centeredSlides: true,
      },
      1024: {
        slidesPerView: 3,
        slidesPerGroup: 1,
        spaceBetween: 30,
        centeredSlides: true,
      },
    },

    effect: 'slide',
    speed: 600,
    touchRatio: 0.8,
    touchAngle: 45,
    resistance: true,
    resistanceRatio: 0.85,
    watchOverflow: true,
    preventInteractionOnTransition: true,

    a11y: {
      enabled: true,
      prevSlideMessage: 'Previous skill',
      nextSlideMessage: 'Next skill',
    },

    on: {
      init: function () {
        updateActiveSkillTitle(this);
      },
      slideChange: function () {
        updateActiveSkillTitle(this);
      },
    },
  });

  function updateActiveSkillTitle(swiper) {
    swiperElement.querySelectorAll('.skill-title').forEach((skill) => {
      skill.classList.remove('active');
    });

    const activeSlide = swiper.slides[swiper.activeIndex];
    const activeTitle = activeSlide?.querySelector('.skill-title');

    if (activeTitle) {
      activeTitle.classList.add('active');
    }
  }

  console.info('[Skills Swiper] Initialized', {
    totalSlides,
    loopEnabled: canLoop(),
  });
}


// Work Section Filter functionality
function initWorkFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterButtons.length === 0 || projectCards.length === 0) {
    return;
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const filter = this.getAttribute('data-filter');

      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));

      // Add active class to clicked button
      this.classList.add('active');

      // Filter project cards
      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');

        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            if (card.style.opacity === '0') {
              card.style.display = 'none';
            }
          }, 300);
        }
      });
    });
  });
}