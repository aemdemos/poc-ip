import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  getMetadata,
  toClassName,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function autolinkModals(doc) {
  doc.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');
    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      openModal(origin.href);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Processes the page-level .metadata div: extracts key/value pairs into
 * <meta> tags in <head>, sets <title>, then removes the div so that
 * decorateBlocks never treats it as a block.
 * @param {Element} main The main element
 */
function processPageMetadata(main) {
  const metadataBlock = main.querySelector('.metadata');
  if (!metadataBlock) return;

  const rows = [...metadataBlock.querySelectorAll(':scope > div')];
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;

    const key = cells[0].textContent.trim().toLowerCase();
    if (!key) return;

    // Strip HTML to get plain text value
    const tmp = document.createElement('div');
    tmp.innerHTML = cells[1].innerHTML;
    const value = tmp.textContent.trim();

    // Create <meta> tag if not already present
    const attr = key.includes(':') ? 'property' : 'name';
    if (!document.head.querySelector(`meta[${attr}="${key}"]`)) {
      const meta = document.createElement('meta');
      meta.setAttribute(attr, key);
      meta.setAttribute('content', value);
      document.head.appendChild(meta);
    }

    if (key === 'title' && value) {
      document.title = value;
    }
  });

  // Remove the section that contains the metadata div
  const section = metadataBlock.closest('.section');
  if (section) {
    section.remove();
  } else {
    metadataBlock.remove();
  }
}

function a11yLinks(main) {
  const links = main.querySelectorAll('a');
  links.forEach((link) => {
    let label = link.textContent;
    if (!label && link.querySelector('span.icon')) {
      const icon = link.querySelector('span.icon');
      label = icon ? icon.classList[1]?.split('-')[1] : label;
    }
    link.setAttribute('aria-label', label);
  });
}

/**
 * Art direction: merge mobile + desktop picture pairs into a single
 * <picture> with a <source media="(min-width: 768px)">.
 *
 * Handles TWO DOM shapes produced by different pipelines:
 *
 * A) Deployed AEM (helix pipeline) — splits images into separate <p>:
 *    <p><picture>mobile</picture></p>
 *    <p><picture>desktop</picture></p>
 *
 * B) Local preview (auto-convert hook) — keeps both in one <p>:
 *    <p><picture>mobile</picture> <picture>desktop</picture></p>
 *
 * Pairs are identified by matching alt text on the <img> elements.
 * After merging the browser natively serves the right image per viewport.
 */
function mergeArtDirectionPictures(container) {
  // Helper: merge a mobile + desktop picture pair into one <picture>
  function merge(mobilePic, desktopPic) {
    const mobileImg = mobilePic.querySelector('img');
    const desktopImg = desktopPic.querySelector('img');
    if (!mobileImg || !desktopImg) return;
    if (mobileImg.alt !== desktopImg.alt) return;

    const picture = document.createElement('picture');
    const source = document.createElement('source');
    source.media = '(min-width: 768px)';
    source.srcset = desktopImg.src;
    picture.append(source);
    picture.append(mobileImg.cloneNode(true));

    mobilePic.replaceWith(picture);
    desktopPic.remove();
  }

  // Pass 1: adjacent <picture> siblings anywhere in main (local hook + block cells)
  container.querySelectorAll('picture + picture').forEach((desktopPic) => {
    const mobilePic = desktopPic.previousElementSibling;
    if (!mobilePic || mobilePic.tagName !== 'PICTURE') return;
    merge(mobilePic, desktopPic);
  });

  // Pass 2: consecutive <p> elements each with exactly 1 <picture> (deployed AEM)
  container.querySelectorAll(':scope > div').forEach((sectionDiv) => {
    const paragraphs = [...sectionDiv.querySelectorAll('p')];
    for (let i = paragraphs.length - 1; i > 0; i -= 1) {
      const curr = paragraphs[i];
      const prev = paragraphs[i - 1];
      if (
        prev.nextElementSibling === curr
        && curr.querySelectorAll('picture').length === 1
        && prev.querySelectorAll('picture').length === 1
      ) {
        const currPic = curr.querySelector('picture');
        const prevPic = prev.querySelector('picture');
        const currImg = currPic.querySelector('img');
        const prevImg = prevPic.querySelector('img');
        if (currImg && prevImg && currImg.alt === prevImg.alt) {
          merge(prevPic, currPic);
          curr.remove();
          paragraphs.splice(i, 1);
        }
      }
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // Merge art direction picture pairs before any other decoration
  mergeArtDirectionPictures(main);
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  processPageMetadata(main);
  decorateBlocks(main);
  // add aria-label to links
  a11yLinks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);

    // decorateTemplateAndTheme must run AFTER processPageMetadata (inside
    // decorateMain) so that the <meta name="template"> tag already exists.
    decorateTemplateAndTheme();

    // load template-specific CSS
    const templateName = getMetadata('template');
    if (templateName) {
      const templateSlug = toClassName(templateName);
      loadCSS(`${window.hlx.codeBasePath}/templates/${templateSlug}/${templateSlug}.css`);
    }

    if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
      doc.body.dataset.breadcrumbs = true;
    }

    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
