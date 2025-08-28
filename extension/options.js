const DEFAULTS = {
captureClicks: true,
captureKeystrokes: false,
serverUrl: 'http://localhost:4000',
batchSize: 20,
flushIntervalMs: 3000
};


const els = {
captureClicks: document.getElementById('captureClicks'),
captureKeystrokes: document.getElementById('captureKeystrokes'),
serverUrl: document.getElementById('serverUrl'),
batchSize: document.getElementById('batchSize'),
flushIntervalMs: document.getElementById('flushIntervalMs'),
status: document.getElementById('status'),
save: document.getElementById('save')
};


async function load() {
const data = await chrome.storage.sync.get(DEFAULTS);
Object.entries(DEFAULTS).forEach(([k, v]) => {
const el = els[k];
if (!el) return;
el[el.type === 'checkbox' ? 'checked' : 'value'] = data[k];
});
}


els.save.addEventListener('click', async () => {
const payload = {
captureClicks: els.captureClicks.checked,
captureKeystrokes: els.captureKeystrokes.checked,
serverUrl: els.serverUrl.value.trim() || DEFAULTS.serverUrl,
batchSize: Math.max(1, parseInt(els.batchSize.value || DEFAULTS.batchSize, 10)),
flushIntervalMs: Math.max(500, parseInt(els.flushIntervalMs.value || DEFAULTS.flushIntervalMs, 10))
};
await chrome.storage.sync.set(payload);
els.status.textContent = 'Saved';
setTimeout(() => (els.status.textContent = ''), 1500);
});


load();
