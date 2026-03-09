/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS - Subpage template parsers
import subpageColumnsParser from './parsers/subpage-columns.js';
import columnsGrayBoxParser from './parsers/columns-gray-box.js';

// TRANSFORMER IMPORTS - Site-wide and subpage-specific transformers
import cleanupTransformer from './transformers/americanhome-cleanup.js';
import subpageTransformer from './transformers/americanhome-subpage.js';

// PARSER REGISTRY - Map block names to parser functions
const parsers = {
  'columns': subpageColumnsParser,
  'columns-gray-box': columnsGrayBoxParser,
};

// TRANSFORMER REGISTRY - Executed in order
const transformers = [
  cleanupTransformer,
  subpageTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'americanhome-subpage',
  description: 'Interior subpage with blue H1 banner, service cards, columns blocks, and contact sections for policyholder information',
  urls: [
    'https://www.americanhome.co.jp/home/customers',
    'https://www.americanhome.co.jp/home/customers/deduction',
    'https://www.americanhome.co.jp/home/customers/claim',
  ],
  blocks: [
    {
      name: 'columns',
      instances: [
        '.container:has(> .cmp-container > .aem-Grid > .image.thirdwidth)',
        '.container.halfwidth.nobottomspace.notopspace:has(.teaserflex + .image)',
        '.container.quarterwidth + .container.threequarterwidth',
      ],
    },
    {
      name: 'columns-bordered',
      instances: [
        '.halfwidth.paleblueborder.completeborder',
      ],
    },
    {
      name: 'columns-gray-box',
      instances: [
        '.container.aiglightgray.completeborder',
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

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (cleanup header, footer, mobile duplicates)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    // 4. Execute afterTransform transformers (reference numbers, section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Add Template: subpage to the metadata block
    const allTables = main.querySelectorAll('table');
    for (const table of allTables) {
      const th = table.querySelector('th');
      if (th && th.textContent.trim() === 'Metadata') {
        const tr = document.createElement('tr');
        const tdKey = document.createElement('td');
        tdKey.textContent = 'template';
        const tdVal = document.createElement('td');
        tdVal.textContent = 'subpage';
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
