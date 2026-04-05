let activeTabId = null;
let startTime = null;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const now = Date.now();
  if (activeTabId && startTime) {
    const duration = now - startTime;
    const tab = await chrome.tabs.get(activeTabId);
    chrome.storage.local.get(["timeLogs"], (result) => {
      const logs = result.timeLogs || {};
      const hostname = new URL(tab.url).hostname;
      logs[hostname] = (logs[hostname] || 0) + duration / 1000;
      chrome.storage.local.set({ timeLogs: logs });
    });
  }
  activeTabId = activeInfo.tabId;
  startTime = now;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getTimeLogs") {
    chrome.storage.local.get(["timeLogs"], (result) => {
      sendResponse(result.timeLogs || {});
    });
    return true; // Indicates async response
  }
});
