import { moveInstrumentation } from '../../scripts/scripts.js';

async function fetchPlaceholders() { return {}; }

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-promo');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-promo-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-promo-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-promo-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-promo-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-promo-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-promo-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-promo-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-promo-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-promo-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

function decorateRateBolus(slide) {
  const content = slide.querySelector('.carousel-promo-slide-content');
  if (!content) return;

  const children = [...content.children];

  // Find CTA: last element containing an <a> tag
  let ctaIdx = -1;
  for (let i = children.length - 1; i >= 0; i -= 1) {
    if (children[i].querySelector('a')) { ctaIdx = i; break; }
  }
  if (ctaIdx < 3) return;

  // Bolus elements: from index 2 (after h2 + subtitle) up to CTA
  const bolusEls = children.slice(2, ctaIdx);
  if (bolusEls.length === 0) return;

  // Last bolus element is the price (contains €/mes)
  const priceEl = bolusEls[bolusEls.length - 1];
  const detailEls = bolusEls.slice(0, -1);

  // Build rate-bolus container
  const bolus = document.createElement('div');
  bolus.classList.add('carousel-promo-rate-bolus');

  // Left side: plan details
  const details = document.createElement('div');
  details.classList.add('carousel-promo-rate-bolus-details');
  detailEls.forEach((el) => details.append(el));

  // Right side: price circle
  const circle = document.createElement('div');
  circle.classList.add('carousel-promo-rate-bolus-price');

  const priceText = priceEl.textContent.trim();
  const match = priceText.match(/(\d+)\D(\d+)\s*(€\/mes)\s*(PRECIO FINAL)/i);

  if (match) {
    const [, amount, decimals, unit, label] = match;
    const grid = document.createElement('span');
    grid.classList.add('carousel-promo-price');
    grid.innerHTML = `<span class="carousel-promo-price-amount">${amount}</span><sup class="carousel-promo-price-decimals">'${decimals}</sup><sub class="carousel-promo-price-recurrence">${unit}</sub><p class="carousel-promo-price-label"><strong>${label}</strong></p>`;
    circle.append(grid);
    priceEl.remove();
  } else {
    circle.append(priceEl);
  }

  bolus.append(details);
  bolus.append(circle);

  // Append bolus to content area, before the CTA button
  const ctaEl = children[ctaIdx];
  content.insertBefore(bolus, ctaEl);
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-promo-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-promo-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-promo-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-promo-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    moveInstrumentation(row, slide);
    decorateRateBolus(slide);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-promo-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
