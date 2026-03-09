const SESSION_KEY = 'fullyframe_active';
const REFRESH_BUFFER_SEC = 3;

let isActive = false;
let targetIframe = null;
let originalStyle = '';
let originalBodyOverflow = '';
let refreshTimer = null;

// --- JWT decoding ---

function extractTokenExpiry(url) {
  const jwtPattern = /[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;
  const candidates = url.match(jwtPattern) || [];

  for (const candidate of candidates) {
    try {
      const parts = candidate.split('.');
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      const payload = JSON.parse(atob(base64));
      if (payload.exp && typeof payload.exp === 'number') {
        return payload.exp;
      }
    } catch { /* not a valid JWT */ }
  }
  return null;
}

// --- Auto-refresh scheduling ---

function scheduleRefresh(iframeSrc) {
  clearRefreshTimer();

  const exp = extractTokenExpiry(iframeSrc);
  if (!exp) {
    console.log('[FullyFrame] No JWT exp found in iframe URL — no auto-refresh.');
    return;
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const delaySec = Math.max(exp - nowSec + REFRESH_BUFFER_SEC, 5);
  const fireAt = new Date((exp + REFRESH_BUFFER_SEC) * 1000);

  console.log(`[FullyFrame] Token expires at ${fireAt.toLocaleTimeString()} — page will refresh in ${delaySec}s`);

  refreshTimer = setTimeout(() => {
    console.log('[FullyFrame] Token expired — refreshing page.');
    location.reload();
  }, delaySec * 1000);
}

function clearRefreshTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

// --- Iframe detection ---

function findIframe() {
  return document.querySelector('iframe[title="Page Preview"]')
    || document.querySelector('iframe[src*="previewToken"]')
    || document.querySelector('iframe[src*="preview-aemcoder"]')
    || findLargestIframe();
}

function findLargestIframe() {
  const iframes = Array.from(document.querySelectorAll('iframe[src]'));
  if (!iframes.length) return null;
  return iframes.reduce((best, el) => {
    const area = el.offsetWidth * el.offsetHeight;
    const bestArea = best.offsetWidth * best.offsetHeight;
    return area > bestArea ? el : best;
  });
}

// --- Fullscreen toggle ---

const FULLSCREEN_CSS =
  'position:fixed!important;top:0!important;left:0!important;' +
  'width:100vw!important;height:100vh!important;' +
  'z-index:2147483647!important;border:none!important;' +
  'margin:0!important;padding:0!important;background:#fff!important;';

function activate() {
  const iframe = findIframe();
  if (!iframe) return false;

  targetIframe = iframe;
  originalStyle = iframe.getAttribute('style') || '';
  originalBodyOverflow = document.body.style.overflow;

  iframe.style.cssText = FULLSCREEN_CSS;
  document.body.style.overflow = 'hidden';

  isActive = true;
  sessionStorage.setItem(SESSION_KEY, '1');

  scheduleRefresh(iframe.src);

  return true;
}

function deactivate() {
  clearRefreshTimer();

  if (targetIframe) {
    targetIframe.style.cssText = originalStyle;
    targetIframe = null;
    originalStyle = '';
  }

  document.body.style.overflow = originalBodyOverflow;
  isActive = false;
  sessionStorage.removeItem(SESSION_KEY);
}

// --- ESC key to deactivate ---

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isActive) {
    deactivate();
    chrome.runtime.sendMessage({ type: 'STATE_CHANGED', active: false });
  }
});

// --- Message handler ---

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'TOGGLE') {
    if (isActive) {
      deactivate();
      sendResponse({ active: false });
    } else {
      const ok = activate();
      sendResponse({ active: ok });
    }
  } else if (msg.type === 'GET_STATUS') {
    sendResponse({ active: isActive });
  }
  return true;
});

// --- Auto-activate on page load if this tab had it on ---

if (sessionStorage.getItem(SESSION_KEY)) {
  let attempts = 0;
  const tryActivate = () => {
    if (activate()) {
      console.log('[FullyFrame] Auto-activated on page load.');
      chrome.runtime.sendMessage({ type: 'STATE_CHANGED', active: true });
      return;
    }
    if (++attempts < 30) {
      setTimeout(tryActivate, 500);
    }
  };
  tryActivate();
}
