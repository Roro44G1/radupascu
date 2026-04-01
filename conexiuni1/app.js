// ============================================
// CONEXIUNI - SPA Pure JavaScript
// ============================================

// Gallery Data
const galleryData = [
  {
    id: 1,
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663130980155/ZwPVHs9MTwqrcRxeGud8eT/gallery-workshop-PRx2SyQKpWuqv9mAFqH4rA.webp',
    alt: 'Workshop creativ cu participanți',
    category: 'Educație',
    title: 'Ateliere de Creativitate'
  },
  {
    id: 2,
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663130980155/ZwPVHs9MTwqrcRxeGud8eT/gallery-conference-TKGaahbUmFYPu4sMQWCYXG.webp',
    alt: 'Conferință profesională',
    category: 'Cultură',
    title: 'Conferințe și Seminarii'
  },
  {
    id: 3,
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663130980155/ZwPVHs9MTwqrcRxeGud8eT/gallery-cultural-event-Tdszgipr4amW5W3fysJBoY.webp',
    alt: 'Festival cultural vibrant',
    category: 'Cultură',
    title: 'Festivaluri Culturale'
  },
  {
    id: 4,
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663130980155/ZwPVHs9MTwqrcRxeGud8eT/gallery-community-service-cbwYyquAC9SYuYX9c8Vs74.webp',
    alt: 'Activitate de voluntariat',
    category: 'Social',
    title: 'Voluntariat și Comunitate'
  },
  {
    id: 5,
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663130980155/ZwPVHs9MTwqrcRxeGud8eT/gallery-outdoor-activity-WXyVzeMDprEsDZtZMhgJ5J.webp',
    alt: 'Expediție în natură',
    category: 'Turism',
    title: 'Turism Cultural și Ecoturism'
  },
  {
    id: 6,
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663130980155/ZwPVHs9MTwqrcRxeGud8eT/gallery-youth-program-YnRymchoPXHF5qGvg4zUCu.webp',
    alt: 'Program pentru tineri',
    category: 'Educație',
    title: 'Programe pentru Tineri'
  },
  {
    id: 7,
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663130980155/ZwPVHs9MTwqrcRxeGud8eT/gallery-exhibition-hVfZtBZsCAWzB8YKNc9zVW.webp',
    alt: 'Expoziție de artă',
    category: 'Cultură',
    title: 'Expoziții de Artă'
  },
  {
    id: 8,
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663130980155/ZwPVHs9MTwqrcRxeGud8eT/gallery-networking-ZdfmRmgjsm6D3hCizRH9sY.webp',
    alt: 'Eveniment de networking',
    category: 'Parteneriate',
    title: 'Evenimente de Colaborare'
  }
];

const categories = ['Educație', 'Cultură', 'Social', 'Turism', 'Parteneriate'];

let currentFilter = 'Toate';
let currentImageIndex = 0;
let filteredImages = galleryData;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  initLightbox();
  initFormHandler();
});

// ============================================
// GALLERY FUNCTIONS
// ============================================

function initGallery() {
  renderGalleryFilters();
  renderGallery();
}

function renderGalleryFilters() {
  const filtersContainer = document.getElementById('gallery-filters');
  if (!filtersContainer) return;

  filtersContainer.innerHTML = '';

  // "Toate" button
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn active';
  allBtn.textContent = 'Toate';
  allBtn.addEventListener('click', () => filterGallery('Toate'));
  filtersContainer.appendChild(allBtn);

  // Category buttons
  categories.forEach(category => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = category;
    btn.addEventListener('click', () => filterGallery(category));
    filtersContainer.appendChild(btn);
  });
}

function filterGallery(category) {
  currentFilter = category;
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent === category) {
      btn.classList.add('active');
    }
  });

  // Filter images
  if (category === 'Toate') {
    filteredImages = galleryData;
  } else {
    filteredImages = galleryData.filter(img => img.category === category);
  }

  currentImageIndex = 0;
  renderGallery();
}

function renderGallery() {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;

  galleryGrid.innerHTML = '';

  filteredImages.forEach((image, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
      <img src="${image.src}" alt="${image.alt}" loading="lazy">
      <div class="gallery-overlay">
        <h4>${image.title}</h4>
        <p>${image.category}</p>
      </div>
    `;
    item.addEventListener('click', () => openLightbox(index));
    galleryGrid.appendChild(item);
  });
}

// ============================================
// LIGHTBOX FUNCTIONS
// ============================================

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', previousImage);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', nextImage);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') previousImage();
    if (e.key === 'ArrowRight') nextImage();
  });
}

function openLightbox(index) {
  currentImageIndex = index;
  updateLightbox();
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = 'auto';
}

function previousImage() {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    updateLightbox();
  }
}

function nextImage() {
  if (currentImageIndex < filteredImages.length - 1) {
    currentImageIndex++;
    updateLightbox();
  }
}

function updateLightbox() {
  const image = filteredImages[currentImageIndex];
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCategory = document.getElementById('lightbox-category');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (lightboxImage) lightboxImage.src = image.src;
  if (lightboxImage) lightboxImage.alt = image.alt;
  if (lightboxTitle) lightboxTitle.textContent = image.title;
  if (lightboxCategory) lightboxCategory.textContent = image.category;
  if (lightboxCounter) lightboxCounter.textContent = `${currentImageIndex + 1} / ${filteredImages.length}`;

  // Update button visibility
  if (prevBtn) {
    prevBtn.style.display = currentImageIndex > 0 ? 'flex' : 'none';
  }
  if (nextBtn) {
    nextBtn.style.display = currentImageIndex < filteredImages.length - 1 ? 'flex' : 'none';
  }
}

// ============================================
// FORM HANDLER
// ============================================

function initFormHandler() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Simple validation
    if (!name || !email || !message) {
      alert('Vă rog completați toate câmpurile!');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Vă rog introduceți o adresă de email validă!');
      return;
    }

    // Success message
    alert('Mulțumim! Mesajul dvs. a fost trimis cu succes.');
    form.reset();
  });
}

// ============================================
// SMOOTH SCROLL UTILITY
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
