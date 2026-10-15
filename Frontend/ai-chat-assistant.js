// AI Chat Assistant Project Page JavaScript

// Initialize AOS Animations
AOS.init({
  duration: 800,
  easing: 'ease',
  once: true,
  offset: 100
});

// Main application initialization
document.addEventListener('DOMContentLoaded', function() {

  // Initialize hamburger menu
  initHamburgerMenu();

  // Load saved theme
  loadSavedTheme();

  // Initialize image interactions
  initImageInteractions();
});

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

// Load saved theme from localStorage
function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  toggleTheme(savedTheme);
}

// Theme toggle functionality
function toggleTheme(theme) {
  const body = document.body;
  const darkLabel = document.querySelector('.toggle-label:first-child');
  const lightLabel = document.querySelector('.toggle-label:last-child');

  if (theme === 'light') {
    body.classList.add('light-theme');
    body.classList.remove('dark-theme');
    darkLabel.classList.remove('active');
    lightLabel.classList.add('active');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.add('dark-theme');
    body.classList.remove('light-theme');
    darkLabel.classList.add('active');
    lightLabel.classList.remove('active');
    localStorage.setItem('theme', 'dark');
  }
}

// Back button functionality
function goBack() {
  window.location.href = 'index.html#work';
}

// Initialize image interactions
function initImageInteractions() {
  const projectImages = document.querySelectorAll('.project-image');

  projectImages.forEach(image => {
    image.addEventListener('click', function() {
      // Create lightbox effect
      createLightbox(this.src, this.alt);
    });
  });
}

// Create lightbox for image viewing
function createLightbox(imageSrc, imageAlt) {
  // Remove existing lightbox if any
  const existingLightbox = document.querySelector('.lightbox');
  if (existingLightbox) {
    existingLightbox.remove();
  }

  // Create lightbox container
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    cursor: pointer;
  `;

  // Create image element
  const img = document.createElement('img');
  img.src = imageSrc;
  img.alt = imageAlt;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  `;

  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 30px;
    background: none;
    border: none;
    color: white;
    font-size: 40px;
    cursor: pointer;
    z-index: 10001;
  `;

  // Add event listeners
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      lightbox.remove();
    }
  });

  closeBtn.addEventListener('click', function() {
    lightbox.remove();
  });

  // Add elements to lightbox
  lightbox.appendChild(img);
  lightbox.appendChild(closeBtn);
  document.body.appendChild(lightbox);

  // Add escape key listener
  const escapeHandler = function(e) {
    if (e.key === 'Escape') {
      lightbox.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Add loading animation for project images
function initImageLoading() {
  const images = document.querySelectorAll('.project-image');

  images.forEach(img => {
    // Remove any existing loading classes
    img.classList.remove('loading', 'loaded', 'error');
  });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initSmoothScrolling();
  initImageLoading();

  // Add scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animateElements = document.querySelectorAll('.project-description, .project-details, .image-item');
  animateElements.forEach(el => observer.observe(el));
});

// Add CSS for animations only
const style = document.createElement('style');
style.textContent = `
  .animate-in {
    animation: fadeInUp 0.6s ease forwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);