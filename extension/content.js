(function () {


function post(kind, data) {
chrome.runtime.sendMessage({
type: 'ACTIVITY_EVENT',
data: { kind, time: Date.now(), href: location.href, ...data }
});
}


function handleClick(e) {
const t = safeTarget(e.target);
post('click', {
target: t ? { tag: t.tag, type: t.type, name: t.name } : null,
x: e.clientX,
y: e.clientY
});
}


function handleKey(e) {
const t = safeTarget(e.target);
if (t?.isPassword) return; // never record passwords
// For privacy, only record key metadata, not full value
post('keystroke', {
key: e.key,
code: e.code,
target: t ? { tag: t.tag, type: t.type, name: t.name } : null
});
}


function applySettings(s) {
if (settings) {
// remove previous listeners to avoid dupes
window.removeEventListener('click', handleClick, true);
window.removeEventListener('keydown', handleKey, true);
}


settings = s;


if (settings.captureClicks) {
window.addEventListener('click', handleClick, true);
}


if (settings.captureKeystrokes) {
window.addEventListener('keydown', handleKey, true);
}
}


chrome.runtime.sendMessage({ type: 'REQUEST_SETTINGS' }, (resp) => {
if (resp && resp.settings) {
applySettings(resp.settings);
}
});


chrome.storage.onChanged.addListener((changes, area) => {
if (area !== 'sync') return;
const merged = { ...settings };
for (const [k, v] of Object.entries(changes)) merged[k] = v.newValue;
applySettings(merged);
});
})();
