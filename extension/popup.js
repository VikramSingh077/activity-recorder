const enabledEl = document.getElementById('enabled');


async function load() {
const { enabled } = await chrome.storage.sync.get({ enabled: true });
enabledEl.checked = enabled;
}


enabledEl.addEventListener('change', async (e) => {
await chrome.storage.sync.set({ enabled: e.target.checked });
});


load();
