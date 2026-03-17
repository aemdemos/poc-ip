/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS - Yakkan template parsers
import accordionParser from './parsers/yakkan-accordion.js';

// TRANSFORMER IMPORTS - Site-wide and yakkan-specific transformers
import cleanupTransformer from './transformers/americanhome-cleanup.js';
import yakkanTransformer from './transformers/americanhome-yakkan.js';

// PARSER REGISTRY - Map block names to parser functions
const parsers = {
  'accordion': accordionParser,
};

// TRANSFORMER REGISTRY - Executed in order
// yakkanTransformer MUST run before cleanupTransformer in beforeTransform
// so the art direction map is built before mobile containers are removed.
const transformers = [
  yakkanTransformer,
  cleanupTransformer,
];

// Module-level art direction map (populated by yakkanTransformer.beforeTransform)
const artDirectionMap = new Map();

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'americanhome-yakkan',
  description: 'Policy terms (yakkan) pages with sub-navigation, accordion blocks, and PDF download buttons',
  urls: [
    'https://www.americanhome.co.jp/home/policy/pa_yakkan',
    'https://www.americanhome.co.jp/home/policy/npp_no_yakkan',
  ],
  blocks: [
    {
      name: 'accordion',
      instances: [
        '.accordion.panelcontainer.jp-accordion',
      ],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

/**
 * Build art direction map from mobile containers.
 * Must be called BEFORE cleanup removes .hb_mobile__only containers.
 */
function buildArtDirectionMap(element) {
  artDirectionMap.clear();
  const mobileContainers = element.querySelectorAll(
    '.hb_mobile__only, [class*="hb_mobile__only"]'
  );
  mobileContainers.forEach((container) => {
    const links = container.querySelectorAll('a[href*=".pdf"]');
    links.forEach((link) => {
      const img = link.querySelector('img');
      if (img) {
        const href = link.getAttribute('href');
        const src = img.getAttribute('src');
        if (href && src && !artDirectionMap.has(href)) {
          artDirectionMap.set(href, src);
        }
      }
    });
  });
  console.log(`[yakkan] Art direction map: ${artDirectionMap.size} entries`);
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 0. Build art direction map before any cleanup
    buildArtDirectionMap(main);

    // 1. Execute beforeTransform transformers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params, artDirectionMap });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    // 4. Execute afterTransform transformers
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Add template: yakkan to the metadata block
    const allTables = main.querySelectorAll('table');
    for (const table of allTables) {
      const th = table.querySelector('th');
      if (th && th.textContent.trim() === 'Metadata') {
        const tr = document.createElement('tr');
        const tdKey = document.createElement('td');
        tdKey.textContent = 'template';
        const tdVal = document.createElement('td');
        tdVal.textContent = 'yakkan';
        tr.appendChild(tdKey);
        tr.appendChild(tdVal);
        table.appendChild(tr);
        break;
      }
    }

    // 7. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
