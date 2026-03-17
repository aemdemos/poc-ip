var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-americanhome-subpage.js
  var import_americanhome_subpage_exports = {};
  __export(import_americanhome_subpage_exports, {
    default: () => import_americanhome_subpage_default
  });

  // tools/importer/parsers/subpage-columns.js
  function parse(element, { document }) {
    const cells = [];
    const thirdwidthImages = element.querySelectorAll(".image.thirdwidth");
    const halfwidthImages = element.querySelectorAll(".image.halfwidth");
    const items = thirdwidthImages.length > 0 ? thirdwidthImages : halfwidthImages;
    if (items.length >= 2) {
      const row = [];
      items.forEach((item) => {
        const cellContent = [];
        const link = item.querySelector(".cmp-image__link");
        const img = item.querySelector(".cmp-image__image");
        if (link && img) {
          const a = document.createElement("a");
          a.href = link.href;
          const imgClone = img.cloneNode(true);
          a.appendChild(imgClone);
          cellContent.push(a);
        } else if (img) {
          cellContent.push(img.cloneNode(true));
        }
        row.push(cellContent);
      });
      cells.push(row);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "Columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-gray-box.js
  function parse2(element, { document }) {
    const cells = [];
    const row = [];
    const leftCell = [];
    const heading = element.querySelector("h3");
    if (heading) {
      const h3 = document.createElement("h3");
      h3.textContent = heading.textContent.trim();
      leftCell.push(h3);
    }
    const teaserText = element.querySelector(".teaser.halfwidth .cmp-teaser__description p");
    if (teaserText) {
      leftCell.push(teaserText.cloneNode(true));
    }
    row.push(leftCell);
    const rightCell = [];
    const link = element.querySelector(".cmp-image__link");
    const img = element.querySelector(".cmp-image__image");
    if (link && img) {
      const a = document.createElement("a");
      a.href = link.href;
      const imgClone = img.cloneNode(true);
      a.appendChild(imgClone);
      rightCell.push(a);
    } else if (img) {
      rightCell.push(img.cloneNode(true));
    }
    row.push(rightCell);
    cells.push(row);
    const block = WebImporter.Blocks.createBlock(document, { name: "Columns (gray-box)", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/americanhome-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--japan-aha-header"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".hb_mobile__only"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".button.back_to_top"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "input#lastmodifiedDate"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "noscript"
      ]);
      const body = element.querySelector("body") || element;
      if (body.hasAttribute("data-cmp-data-layer-enabled")) {
        body.removeAttribute("data-cmp-data-layer-enabled");
      }
    }
  }

  // tools/importer/transformers/americanhome-subpage.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function createNarrowMeta(document) {
    return WebImporter.Blocks.createBlock(document, {
      name: "Section Metadata",
      cells: [[["style"], ["narrow"]]]
    });
  }
  function extractCardContent(card, doc) {
    const frag = doc.createDocumentFragment();
    const els = card.querySelectorAll("h3, h4, p, img, a, hr");
    const seen = /* @__PURE__ */ new Set();
    els.forEach((el) => {
      if (el.tagName === "IMG" && (el.closest("h3") || el.closest("h4") || el.closest("p") || el.closest("a"))) return;
      if (el.tagName === "A" && el.closest("p")) return;
      if (seen.has(el)) return;
      seen.add(el);
      if (el.tagName === "H3" || el.tagName === "H4") {
        const img = el.querySelector("img");
        if (img) {
          const p = doc.createElement("p");
          p.appendChild(img.cloneNode(true));
          frag.appendChild(p);
        }
      } else {
        frag.appendChild(el.cloneNode(true));
      }
    });
    return frag;
  }
  function extractHalfContent(container, doc) {
    const frag = doc.createDocumentFragment();
    const els = container.querySelectorAll("p, img, a");
    const seen = /* @__PURE__ */ new Set();
    els.forEach((el) => {
      if (el.tagName === "IMG" && (el.closest("p") || el.closest("a"))) return;
      if (el.tagName === "A" && el.closest("p")) return;
      if (seen.has(el)) return;
      seen.add(el);
      frag.appendChild(el.cloneNode(true));
    });
    return frag;
  }
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.beforeTransform) {
      const { document: doc } = payload;
      WebImporter.DOMUtils.remove(element, [
        ".hideinpc"
      ]);
      const outerBorderedWrappers = Array.from(element.querySelectorAll(
        ".paleblueborder.completeborder:not(.halfwidth):not(.topborder):not(.norowspace)"
      )).filter((box) => {
        if (box.parentElement.closest(".paleblueborder.completeborder")) return false;
        return box.querySelector(".halfwidth.paleblueborder.completeborder") !== null;
      });
      outerBorderedWrappers.forEach((wrapper) => {
        const allGrids = wrapper.querySelectorAll(".aem-Grid");
        let contentGrid = null;
        for (const grid of allGrids) {
          const children = Array.from(grid.children);
          const hasMeaningful = children.some((child) => child.classList.contains("teaserflex") || child.classList.contains("flexbox-container") || child.querySelector(".halfwidth.paleblueborder"));
          if (hasMeaningful) {
            contentGrid = grid;
            break;
          }
        }
        if (contentGrid) {
          const frag = doc.createDocumentFragment();
          while (contentGrid.firstChild) {
            frag.appendChild(contentGrid.firstChild);
          }
          wrapper.replaceWith(frag);
        }
      });
      const allHalfwidthCards = Array.from(element.querySelectorAll(
        ".halfwidth.paleblueborder.completeborder"
      ));
      const processedCards = /* @__PURE__ */ new Set();
      let cardPairIdx = 0;
      for (const card of allHalfwidthCards) {
        if (processedCards.has(card)) continue;
        const parent = card.parentElement;
        if (!parent) continue;
        const siblings = Array.from(parent.children).filter(
          (c) => c.classList.contains("halfwidth") && c.classList.contains("paleblueborder") && c.classList.contains("completeborder") && !processedCards.has(c)
        );
        if (siblings.length >= 2) {
          for (let i = 0; i < siblings.length - 1; i += 2) {
            const left = siblings[i];
            const right = siblings[i + 1];
            const leftMarker = doc.createElement("div");
            leftMarker.className = `card-pair-left-${cardPairIdx}`;
            leftMarker.appendChild(extractCardContent(left, doc));
            left.replaceWith(leftMarker);
            const rightMarker = doc.createElement("div");
            rightMarker.className = `card-pair-right-${cardPairIdx}`;
            rightMarker.appendChild(extractCardContent(right, doc));
            right.replaceWith(rightMarker);
            processedCards.add(left);
            processedCards.add(right);
            cardPairIdx += 1;
          }
        }
      }
      const remainingCards = Array.from(element.querySelectorAll(
        ".halfwidth.paleblueborder.completeborder"
      ));
      for (let i = 0; i < remainingCards.length - 1; i += 2) {
        const left = remainingCards[i];
        const right = remainingCards[i + 1];
        const leftMarker = doc.createElement("div");
        leftMarker.className = `card-pair-left-${cardPairIdx}`;
        leftMarker.appendChild(extractCardContent(left, doc));
        left.replaceWith(leftMarker);
        const rightMarker = doc.createElement("div");
        rightMarker.className = `card-pair-right-${cardPairIdx}`;
        rightMarker.appendChild(extractCardContent(right, doc));
        right.replaceWith(rightMarker);
        cardPairIdx += 1;
      }
      const coreblueHeaderBoxes = Array.from(element.querySelectorAll(
        ".paleblueborder.completeborder:not(.halfwidth):not(.topborder):not(.norowspace)"
      )).filter((box) => {
        if (box.parentElement.closest(".paleblueborder.completeborder")) return false;
        return box.querySelector(".coreblue h2") !== null;
      });
      coreblueHeaderBoxes.forEach((box) => {
        const frag = doc.createDocumentFragment();
        const h2 = box.querySelector(".coreblue h2");
        if (h2) frag.appendChild(h2.cloneNode(true));
        const bodySection = box.querySelector(".paleblueborder.topborder");
        if (bodySection) {
          const flexContainers = Array.from(bodySection.querySelectorAll(".flexbox-container"));
          flexContainers.forEach((fc) => {
            const innerGrid = fc.querySelector(".aem-Grid");
            if (!innerGrid) return;
            const teasers = Array.from(innerGrid.querySelectorAll(":scope > .teaserflex"));
            teasers.forEach((teaser) => {
              const h3s = teaser.querySelectorAll("h3");
              h3s.forEach((h3El) => frag.appendChild(h3El.cloneNode(true)));
              const ps = teaser.querySelectorAll(".cmp-teaser__description p");
              ps.forEach((p) => frag.appendChild(p.cloneNode(true)));
              teaser.remove();
            });
            const hasColumnsImages = innerGrid.querySelector(".image.thirdwidth, .image.halfwidth");
            if (hasColumnsImages) {
              frag.appendChild(fc);
            } else {
              const imgContainers = innerGrid.querySelectorAll(".cmp-image");
              imgContainers.forEach((ic) => {
                const link = ic.querySelector(".cmp-image__link");
                const img = ic.querySelector(".cmp-image__image");
                if (link && img) {
                  const p = doc.createElement("p");
                  const a = doc.createElement("a");
                  a.href = link.href;
                  a.appendChild(img.cloneNode(true));
                  p.appendChild(a);
                  frag.appendChild(p);
                } else if (img) {
                  const p = doc.createElement("p");
                  p.appendChild(img.cloneNode(true));
                  frag.appendChild(p);
                }
              });
            }
          });
        }
        box.replaceWith(frag);
      });
      const fullBorderedBoxes = Array.from(element.querySelectorAll(
        ".paleblueborder.completeborder:not(.halfwidth):not(.topborder):not(.norowspace)"
      )).filter((box) => !box.parentElement.closest(".paleblueborder.completeborder"));
      let borderedBoxCount = 0;
      fullBorderedBoxes.forEach((box) => {
        const innerGrayHeader = box.querySelector(".aiglightgray");
        const innerHalfwidths = Array.from(box.querySelectorAll(".halfwidth:not(.paleblueborder)"));
        const h3 = box.querySelector("h3");
        if (innerGrayHeader && h3) {
          const frag = doc.createDocumentFragment();
          const h3Clone = doc.createElement("h3");
          h3Clone.textContent = h3.textContent.trim();
          frag.appendChild(h3Clone);
          const bodySection = box.querySelector(".paleblueborder.topborder");
          if (bodySection) {
            const textP = bodySection.querySelector(".cmp-teaser__description p");
            if (textP) frag.appendChild(textP.cloneNode(true));
            const link = bodySection.querySelector(".cmp-image__link");
            const img = bodySection.querySelector(".cmp-image__image");
            if (link && img) {
              const p = doc.createElement("p");
              const a = doc.createElement("a");
              a.href = link.href;
              a.appendChild(img.cloneNode(true));
              p.appendChild(a);
              frag.appendChild(p);
            } else if (img) {
              const p = doc.createElement("p");
              p.appendChild(img.cloneNode(true));
              frag.appendChild(p);
            }
          }
          const markerDiv = doc.createElement("div");
          markerDiv.className = `gray-box-marker-${borderedBoxCount}`;
          markerDiv.appendChild(frag);
          box.replaceWith(markerDiv);
        } else if (innerHalfwidths.length === 2 && h3) {
          const leftFrag = doc.createDocumentFragment();
          const h3Clone = doc.createElement("h3");
          h3Clone.textContent = h3.textContent.trim();
          leftFrag.appendChild(h3Clone);
          const textP = innerHalfwidths[0].querySelector(".cmp-teaser__description p");
          if (textP) leftFrag.appendChild(textP.cloneNode(true));
          const rightFrag = doc.createDocumentFragment();
          const link = innerHalfwidths[1].querySelector(".cmp-image__link");
          const img = innerHalfwidths[1].querySelector(".cmp-image__image");
          if (link && img) {
            const a = doc.createElement("a");
            a.href = link.href;
            a.appendChild(img.cloneNode(true));
            rightFrag.appendChild(a);
          } else if (img) {
            rightFrag.appendChild(img.cloneNode(true));
          }
          const leftDiv = doc.createElement("div");
          leftDiv.className = `bordered-box-left-${borderedBoxCount}`;
          leftDiv.appendChild(leftFrag);
          const rightDiv = doc.createElement("div");
          rightDiv.className = `bordered-box-right-${borderedBoxCount}`;
          rightDiv.appendChild(rightFrag);
          box.replaceWith(leftDiv);
          leftDiv.after(rightDiv);
        } else {
          const frag = doc.createDocumentFragment();
          const elems = box.querySelectorAll("h3, p, img");
          const seen = /* @__PURE__ */ new Set();
          elems.forEach((el) => {
            if (el.tagName === "IMG" && (el.closest("p") || el.closest("a"))) return;
            if (seen.has(el)) return;
            seen.add(el);
            frag.appendChild(el.cloneNode(true));
          });
          const markerDiv = doc.createElement("div");
          markerDiv.className = `bordered-box-single-${borderedBoxCount}`;
          markerDiv.appendChild(frag);
          box.replaceWith(markerDiv);
        }
        borderedBoxCount += 1;
      });
      const allDttHeadings = element.querySelectorAll(".dttitlecoreblue.left-border-h2");
      let halfwidthPairCount = 0;
      for (const heading of allDttHeadings) {
        const parent = heading.parentElement;
        if (!parent) continue;
        const candidates = Array.from(parent.querySelectorAll(":scope > .halfwidth:not(.paleblueborder)"));
        if (candidates.length === 2) {
          candidates.forEach((hw, idx) => {
            const markerDiv = doc.createElement("div");
            markerDiv.className = idx === 0 ? `halfwidth-col-left-${halfwidthPairCount}` : `halfwidth-col-right-${halfwidthPairCount}`;
            markerDiv.appendChild(extractHalfContent(hw, doc));
            hw.replaceWith(markerDiv);
          });
          halfwidthPairCount += 1;
        }
      }
      const quarterEls = element.querySelectorAll(".quarterwidth");
      for (const quarterEl of quarterEls) {
        const parent = quarterEl.parentElement;
        if (!parent) continue;
        const threeQuarterEl = parent.querySelector(":scope > .threequarterwidth");
        if (!threeQuarterEl) continue;
        const hasHeading = parent.querySelector(":scope > .dttitlecoreblue");
        if (!hasHeading) continue;
        const leftMarker = doc.createElement("div");
        leftMarker.className = "video-col-left";
        leftMarker.appendChild(extractHalfContent(quarterEl, doc));
        quarterEl.replaceWith(leftMarker);
        const rightMarker = doc.createElement("div");
        rightMarker.className = "video-col-right";
        rightMarker.appendChild(extractHalfContent(threeQuarterEl, doc));
        threeQuarterEl.replaceWith(rightMarker);
        break;
      }
    }
    if (hookName === TransformHook2.afterTransform) {
      const { document } = payload;
      const columnsTables = Array.from(element.querySelectorAll("table"));
      for (let i = 0; i < columnsTables.length - 1; i++) {
        const first = columnsTables[i];
        const second = columnsTables[i + 1];
        const firstTh = first.querySelector("th");
        const secondTh = second.querySelector("th");
        if (!firstTh || !secondTh) continue;
        if (firstTh.textContent.trim() !== "Columns") continue;
        if (secondTh.textContent.trim() !== "Columns") continue;
        if (first.nextElementSibling !== second) continue;
        const firstRows = Array.from(first.querySelectorAll("tr")).slice(1);
        const secondRows = Array.from(second.querySelectorAll("tr")).slice(1);
        let maxCols = 0;
        firstRows.forEach((r) => {
          maxCols = Math.max(maxCols, r.children.length);
        });
        const allCells = [...firstRows, ...secondRows].flatMap((r) => Array.from(r.children));
        const allImageOnly = allCells.every((td) => {
          const imgs = td.querySelectorAll("img");
          return imgs.length === 1 && td.textContent.trim() === "";
        });
        if (allImageOnly && firstRows.length === 1 && secondRows.length === 1) {
          const firstRow = firstRows[0];
          Array.from(secondRows[0].children).forEach((td) => firstRow.appendChild(td));
          const thCell = first.querySelector("th");
          if (thCell) thCell.colSpan = firstRow.children.length;
        } else {
          secondRows.forEach((row) => {
            while (row.children.length < maxCols) {
              row.appendChild(document.createElement("td"));
            }
            first.appendChild(row);
          });
        }
        second.remove();
        columnsTables.splice(i + 1, 1);
        i--;
      }
      for (let i = 0; ; i++) {
        const leftMarker = element.querySelector(`.card-pair-left-${i}`);
        const rightMarker = element.querySelector(`.card-pair-right-${i}`);
        if (!leftMarker || !rightMarker) break;
        const leftClone = leftMarker.cloneNode(true);
        const rightClone = rightMarker.cloneNode(true);
        const block = WebImporter.Blocks.createBlock(document, {
          name: "Columns (bordered)",
          cells: [[[leftClone], [rightClone]]]
        });
        leftMarker.before(block);
        leftMarker.remove();
        rightMarker.remove();
      }
      for (let i = 0; ; i++) {
        const marker = element.querySelector(`.gray-box-marker-${i}`);
        if (!marker) break;
        const clone = marker.cloneNode(true);
        const block = WebImporter.Blocks.createBlock(document, {
          name: "Columns (gray-box)",
          cells: [[[clone]]]
        });
        marker.before(block);
        marker.remove();
      }
      const vidLeft = element.querySelector(".video-col-left");
      const vidRight = element.querySelector(".video-col-right");
      if (vidLeft && vidRight) {
        const vidBlock = WebImporter.Blocks.createBlock(document, {
          name: "Columns",
          cells: [[[vidLeft.cloneNode(true)], [vidRight.cloneNode(true)]]]
        });
        vidLeft.before(vidBlock);
        vidLeft.remove();
        vidRight.remove();
      }
      for (let i = 0; ; i++) {
        const hwLeft = element.querySelector(`.halfwidth-col-left-${i}`);
        const hwRight = element.querySelector(`.halfwidth-col-right-${i}`);
        if (!hwLeft || !hwRight) break;
        const hwBlock = WebImporter.Blocks.createBlock(document, {
          name: "Columns",
          cells: [[[hwLeft.cloneNode(true)], [hwRight.cloneNode(true)]]]
        });
        hwLeft.before(hwBlock);
        hwLeft.remove();
        hwRight.remove();
      }
      for (let i = 0; ; i++) {
        const singleMarker = element.querySelector(`.bordered-box-single-${i}`);
        const leftMarker2 = element.querySelector(`.bordered-box-left-${i}`);
        const rightMarker2 = element.querySelector(`.bordered-box-right-${i}`);
        if (!singleMarker && !leftMarker2) break;
        if (singleMarker) {
          const clone = singleMarker.cloneNode(true);
          const block = WebImporter.Blocks.createBlock(document, {
            name: "Columns (bordered)",
            cells: [[[clone]]]
          });
          singleMarker.before(block);
          singleMarker.remove();
        } else if (leftMarker2 && rightMarker2) {
          const lClone = leftMarker2.cloneNode(true);
          const rClone = rightMarker2.cloneNode(true);
          const block = WebImporter.Blocks.createBlock(document, {
            name: "Columns (bordered)",
            cells: [[[lClone], [rClone]]]
          });
          leftMarker2.before(block);
          leftMarker2.remove();
          rightMarker2.remove();
        }
      }
      const allParagraphs = element.querySelectorAll("p");
      let refCodeP = null;
      let pageNumP = null;
      allParagraphs.forEach((p) => {
        const text = p.textContent.trim();
        if (/^(AHA|OM)\d{4}/.test(text)) refCodeP = p;
        if (/^ページ番号/.test(text)) pageNumP = p;
      });
      let refBlock = null;
      if (refCodeP && pageNumP) {
        const cells = [[
          [refCodeP.cloneNode(true)],
          [pageNumP.cloneNode(true)]
        ]];
        refBlock = WebImporter.Blocks.createBlock(document, { name: "Columns", cells });
        refCodeP.replaceWith(refBlock);
        pageNumP.remove();
      } else if (pageNumP && !refCodeP) {
        const cells = [[
          [""],
          [pageNumP.cloneNode(true)]
        ]];
        refBlock = WebImporter.Blocks.createBlock(document, { name: "Columns", cells });
        pageNumP.replaceWith(refBlock);
      }
      const allH2 = Array.from(element.querySelectorAll("h2"));
      const allTables = Array.from(element.querySelectorAll("table"));
      const grayBoxTables = [];
      allTables.forEach((t) => {
        const th = t.querySelector("th");
        if (th && th.textContent.includes("gray-box")) grayBoxTables.push(t);
      });
      const breakPoints = [];
      for (let i = 1; i < allH2.length; i++) {
        breakPoints.push(allH2[i]);
      }
      grayBoxTables.forEach((gbt) => {
        const prevSibling = gbt.previousElementSibling;
        const isAfterH2 = prevSibling && prevSibling.tagName === "HR";
        if (!isAfterH2) {
          breakPoints.push(gbt);
        }
      });
      if (refBlock) {
        breakPoints.push(refBlock);
      }
      breakPoints.sort((a, b) => {
        const pos = a.compareDocumentPosition(b);
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
      breakPoints.forEach((bp) => {
        bp.before(createNarrowMeta(document));
        bp.before(document.createElement("hr"));
      });
      if (refBlock) {
        refBlock.after(createNarrowMeta(document));
      } else {
        element.appendChild(createNarrowMeta(document));
      }
      const firstH1 = element.querySelector("h1");
      if (firstH1) {
        const hr = document.createElement("hr");
        firstH1.after(hr);
      }
    }
  }

  // tools/importer/import-americanhome-subpage.js
  var parsers = {
    "columns": parse,
    "columns-gray-box": parse2
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "americanhome-subpage",
    description: "Interior subpage with blue H1 banner, service cards, columns blocks, and contact sections for policyholder information",
    urls: [
      "https://www.americanhome.co.jp/home/customers",
      "https://www.americanhome.co.jp/home/customers/deduction",
      "https://www.americanhome.co.jp/home/customers/claim",
      "https://www.americanhome.co.jp/home/customers/disability",
      "https://www.americanhome.co.jp/home/customers/family_registration",
      "https://www.americanhome.co.jp/home/customers/confirmation"
    ],
    blocks: [
      {
        name: "columns",
        instances: [
          ".container:has(> .cmp-container > .aem-Grid > .image.thirdwidth)",
          ".container.halfwidth.nobottomspace.notopspace:has(.teaserflex + .image)",
          ".container.quarterwidth + .container.threequarterwidth",
          ".flexbox-container:has(> .cmp-container > .aem-Grid > .image.halfwidth)"
        ]
      },
      {
        name: "columns-bordered",
        instances: [
          ".halfwidth.paleblueborder.completeborder"
        ]
      },
      {
        name: "columns-gray-box",
        instances: [
          ".container.aiglightgray.completeborder",
          ".container.paleblueborder.completeborder:not(.halfwidth):has(> .cmp-container > .aem-Grid > .container > .cmp-container > .aem-Grid > .container.aiglightgray)"
        ]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_americanhome_subpage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const pagePath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "");
      const templateName = pagePath.split("/").pop() || "subpage";
      const allTables = main.querySelectorAll("table");
      for (const table of allTables) {
        const th = table.querySelector("th");
        if (th && th.textContent.trim() === "Metadata") {
          const tr = document.createElement("tr");
          const tdKey = document.createElement("td");
          tdKey.textContent = "template";
          const tdVal = document.createElement("td");
          tdVal.textContent = templateName;
          tr.appendChild(tdKey);
          tr.appendChild(tdVal);
          table.appendChild(tr);
          break;
        }
      }
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_americanhome_subpage_exports);
})();
