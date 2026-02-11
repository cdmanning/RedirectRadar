const EXCLUSIONS = [
  'chrome-extension://',
  'chrome://'
];

function isExcluded(url) {
  for (let i = 0; i < EXCLUSIONS.length; i++) {
    if (url.includes(EXCLUSIONS[i])) {
      return false;
    }
  }
  return true;
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;
  if (!isExcluded(details.url)) return;
  chrome.storage.local.get({ isOn: true, logs: [] }).then((result) => {
    if (!result.isOn) return;
    const logEntry = {
      url: details.url,
      timestamp: new Date().toLocaleString()
    };
    let logs = result.logs;
    logs.push(logEntry);
    if (logs.length > 50) logs = logs.slice(-50);
    chrome.storage.local.set({ logs: logs });
  });
});