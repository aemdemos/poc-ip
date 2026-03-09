chrome.action.onClicked.addListener(async (tab) => {
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE' });
    updateBadge(tab.id, response?.active);
  } catch {
    chrome.action.setBadgeText({ tabId: tab.id, text: '!' });
    chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: '#ef4444' });
  }
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'STATE_CHANGED' && sender.tab) {
    updateBadge(sender.tab.id, msg.active);
  }
});

function updateBadge(tabId, active) {
  if (active) {
    chrome.action.setBadgeText({ tabId, text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#22c55e' });
  } else {
    chrome.action.setBadgeText({ tabId, text: '' });
  }
}
