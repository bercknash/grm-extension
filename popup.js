const DEFAULT_SETTINGS = {
  searchEnabled: true,
  scrollEnabled: true,
  linksEnabled: true,
  floatingEnabled: true,
};

async function loadSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get('grm_ext_settings', data => {
      const stored = data.grm_ext_settings;
      resolve(stored ? { ...DEFAULT_SETTINGS, ...stored } : { ...DEFAULT_SETTINGS });
    });
  });
}

async function saveSettings(settings) {
  return new Promise(resolve => chrome.storage.local.set({ grm_ext_settings: settings }, resolve));
}

async function sendToPage(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  try {
    await chrome.tabs.sendMessage(tab.id, message);
  } catch {
    // Content script not loaded on this page (non-forum page or not yet injected)
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isForumPage = tab?.url?.includes('grassrootsmotorsports.com/forum/');

  const openBtn = document.getElementById('open-search');
  if (!isForumPage) {
    openBtn.disabled = true;
    openBtn.title = 'Only available on GRM forum pages';
  }
  openBtn.addEventListener('click', async () => {
    await sendToPage({ action: 'openSearch' });
    window.close();
  });

  const settings = await loadSettings();

  const SETTINGS_MAP = [
    ['s-search',   'searchEnabled'],
    ['s-scroll',   'scrollEnabled'],
    ['s-links',    'linksEnabled'],
    ['s-floating', 'floatingEnabled'],
  ];

  for (const [id, key] of SETTINGS_MAP) {
    document.getElementById(id).checked = settings[key];
  }

  for (const [id, key] of SETTINGS_MAP) {
    document.getElementById(id).addEventListener('change', async (e) => {
      const s = await loadSettings();
      s[key] = e.target.checked;
      await saveSettings(s);
      sendToPage({ action: 'applySetting', key, value: e.target.checked });
    });
  }
});
