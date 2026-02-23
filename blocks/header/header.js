import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 1025px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (e.relatedTarget && !nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, 'false');
  button.setAttribute('aria-label', expanded ? 'Abrir navegación' : 'Cerrar navegación');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Strips button decoration classes applied by decorateButtons
 * @param {Element} container The container to strip button classes from
 */
function stripButtonClasses(container) {
  container.querySelectorAll('.button-container').forEach((bc) => {
    bc.classList.remove('button-container');
  });
  container.querySelectorAll('.button').forEach((btn) => {
    btn.classList.remove('button', 'primary', 'secondary');
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/content/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';

  // collect all fragment sections
  const fragmentSections = [...fragment.querySelectorAll(':scope > div')];

  // extract topbar from first section (if we have 4+ sections)
  const topbar = document.createElement('div');
  topbar.className = 'nav-topbar';
  if (fragmentSections.length > 3) {
    const topbarSection = fragmentSections.shift();
    while (topbarSection.firstChild) topbar.append(topbarSection.firstChild);
  }

  // build nav from remaining 3 sections: brand, sections, tools
  const nav = document.createElement('nav');
  nav.id = 'nav';
  fragmentSections.forEach((section) => nav.append(section));

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // brand: clean up button decoration on logo link
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    stripButtonClasses(navBrand);
    const brandImg = navBrand.querySelector('img');
    if (brandImg) {
      brandImg.setAttribute('alt', 'Lowi');
      brandImg.closest('a')?.setAttribute('aria-label', 'Lowi — Inicio');
    }
  }

  // sections: set up nav links with dropdowns
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) {
        navSection.classList.add('nav-drop');
        // desktop: open on hover
        navSection.addEventListener('mouseenter', () => {
          if (isDesktop.matches) {
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', 'true');
          }
        });
        navSection.addEventListener('mouseleave', () => {
          if (isDesktop.matches) {
            navSection.setAttribute('aria-expanded', 'false');
          }
        });
        // handle click on the li itself (not just the anchor) so clicks
        // that land on the li element still trigger the accordion toggle
        navSection.addEventListener('click', (e) => {
          // only handle clicks on the top-level link area, not on sub-menu links
          if (e.target.closest('ul ul')) return;
          e.preventDefault();
          if (isDesktop.matches) return;
          const wasExpanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', wasExpanded ? 'false' : 'true');
        });
      }
    });
    stripButtonClasses(navSections);

    // mobile: add "¿Tienes dudas?" help link at the bottom of nav list
    const navList = navSections.querySelector('.default-content-wrapper > ul');
    if (navList) {
      const helpItem = document.createElement('li');
      helpItem.className = 'nav-help-link';
      helpItem.innerHTML = '<a href="/asistencia/">¿Tienes dudas?</a>';
      navList.append(helpItem);
    }
  }

  // tools: add icons to cart and login links
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    stripButtonClasses(navTools);

    // cart link — build icon, then move out of tools into nav
    const cartLink = navTools.querySelector('a[href*="cart"]');
    if (cartLink) {
      cartLink.className = 'nav-cart-link';
      cartLink.setAttribute('aria-label', 'Carrito');
      cartLink.textContent = '';
      const cartIcon = document.createElement('span');
      cartIcon.className = 'icon icon-cart';
      cartIcon.innerHTML = '<img src="/icons/cart.svg" loading="lazy" alt="">';
      cartLink.append(cartIcon);

      // move cart to sit right after nav-sections (before tools)
      const cartWrapper = document.createElement('div');
      cartWrapper.className = 'nav-cart';
      cartWrapper.append(cartLink);
      if (navSections) navSections.after(cartWrapper);
    }

    // login link
    const loginLink = navTools.querySelector('a[href*="milowi"]');
    if (loginLink) {
      loginLink.className = 'nav-login-link';
      const loginText = document.createElement('span');
      loginText.className = 'nav-login-text';
      loginText.textContent = 'Soy Cliente';
      const loginIcon = document.createElement('span');
      loginIcon.className = 'icon icon-user';
      loginIcon.innerHTML = '<img src="/icons/user.svg" loading="lazy" alt="">';
      loginLink.textContent = '';
      loginLink.append(loginText, loginIcon);
    }
  }

  // topbar: strip button decoration and tag links
  stripButtonClasses(topbar);
  const topbarPhoneLink = topbar.querySelector('a[href^="tel:"]');
  if (topbarPhoneLink) topbarPhoneLink.classList.add('topbar-phone');

  const topbarHelpLink = topbar.querySelector('a[href*="asistencia"]');
  if (topbarHelpLink) topbarHelpLink.classList.add('topbar-help');

  const topbarCallbackLink = topbar.querySelector('a[href*="te-llamamos"]');
  if (topbarCallbackLink) topbarCallbackLink.classList.add('topbar-callback');

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Abrir navegación">
    <span class="nav-hamburger-icon"></span>
  </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(topbar);
  navWrapper.append(nav);
  block.append(navWrapper);
}
