export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // Art direction: merge two images (mobile + desktop) into a single <picture>.
      // Supports both <picture>-wrapped images (local) and bare <img> tags (external).
      const pictures = col.querySelectorAll('picture');
      if (pictures.length === 2) {
        const mobileImg = pictures[0].querySelector('img');
        const desktopImg = pictures[1].querySelector('img');
        if (mobileImg && desktopImg) {
          const picture = document.createElement('picture');
          const source = document.createElement('source');
          source.media = '(min-width: 768px)';
          source.srcset = desktopImg.src;
          source.width = desktopImg.getAttribute('width') || desktopImg.naturalWidth;
          source.height = desktopImg.getAttribute('height') || desktopImg.naturalHeight;
          picture.append(source);
          picture.append(mobileImg.cloneNode(true));
          pictures[0].replaceWith(picture);
          const secondWrapper = pictures[1].parentElement;
          pictures[1].remove();
          if (secondWrapper?.tagName === 'P' && !secondWrapper.children.length && !secondWrapper.textContent.trim()) {
            secondWrapper.remove();
          }
        }
      } else if (pictures.length === 0) {
        // Handle bare <img> tags (external URLs not wrapped in <picture> by EDS)
        const imgParas = [...col.querySelectorAll(':scope > p')].filter(
          (p) => p.children.length === 1 && p.querySelector('img'),
        );
        if (imgParas.length === 2) {
          const mobileImg = imgParas[0].querySelector('img');
          const desktopImg = imgParas[1].querySelector('img');
          if (mobileImg && desktopImg) {
            const picture = document.createElement('picture');
            const source = document.createElement('source');
            source.media = '(min-width: 768px)';
            source.srcset = desktopImg.src;
            source.width = desktopImg.getAttribute('width') || '';
            source.height = desktopImg.getAttribute('height') || '';
            picture.append(source);
            picture.append(mobileImg.cloneNode(true));
            imgParas[0].replaceWith(picture);
            imgParas[1].remove();
          }
        }
      }

      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
