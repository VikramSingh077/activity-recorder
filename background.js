// Aggregates events from content script + webNavigation, then batches to the ingestor


function setupFlushTimer() {
if (flushTimer) clearInterval(flushTimer);
flushTimer = setInterval(flush, settings.flushIntervalMs);
}


function enqueue(evt) {
if (!settings.enabled) return;
buffer.push(evt);
if (buffer.length >= settings.batchSize) flush();
}


async function flush() {
if (!settings.enabled || buffer.length === 0) return;
const payload = buffer.splice(0, buffer.length);


try {
await fetch(`${settings.serverUrl}/events`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
source: 'activity-recorder-extension',
ts: Date.now(),
events: payload
})
});
} catch (err) {
// Put events back on failure (rudimentary backpressure)
buffer = payload.concat(buffer);
console.error('Ingest failed:', err);
}
}


// Receive events from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
if (msg && msg.type === 'ACTIVITY_EVENT') {
enqueue({ ...msg.data, tabId: sender.tab?.id });
}
if (msg && msg.type === 'REQUEST_SETTINGS') {
sendResponse({ settings });
}
});


// Track navigation
chrome.webNavigation.onCommitted.addListener(details => {
if (!settings.enabled) return;
if (details.transitionType === 'reload' || details.frameId !== 0) return;
enqueue({
kind: 'navigation',
url: details.url,
tabId: details.tabId,
time: Date.now()
});
});


// React to settings changes
chrome.storage.onChanged.addListener((changes, area) => {
if (area !== 'sync') return;
let requiresTimer = false;
for (const [key, { newValue }] of Object.entries(changes)) {
settings[key] = newValue;
if (key === 'flushIntervalMs') requiresTimer = true;
}
if (requiresTimer) setupFlushTimer();
});


loadSettings();