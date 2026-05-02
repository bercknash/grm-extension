// GRM Forum Extension v2.1.0

(function() {
  'use strict';

  if (!isThreadPage()) return;

  let currentSearchTerm = '';
  let searchResults = [];
  let currentResultIndex = 0;
  let allPages = [];
  let isSearching = false;

  const DEFAULT_SETTINGS = {
    searchEnabled: true,
    scrollEnabled: true,
    linksEnabled: true,
    floatingEnabled: true,
  };

  function loadSettings() {
    return new Promise(resolve => {
      chrome.storage.local.get('grm_ext_settings', data => {
        const stored = data.grm_ext_settings;
        resolve(stored ? { ...DEFAULT_SETTINGS, ...stored } : { ...DEFAULT_SETTINGS });
      });
    });
  }

  function saveSettings(settings) {
    chrome.storage.local.set({ grm_ext_settings: settings });
  }

  // Create and inject the search UI
  function createSearchUI() {
    const searchContainer = document.createElement('div');
    searchContainer.id = 'grm-thread-search';
    searchContainer.innerHTML = `
      <div class="grm-search-header">
        <button id="grm-settings-toggle" class="grm-settings-btn" title="Extension settings">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.892 3.433-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.892-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
          </svg>
        </button>
        <button id="grm-search-toggle" class="grm-toggle-btn" title="Toggle Search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
        </button>
      </div>
      <div id="grm-settings-panel" class="grm-settings-panel" style="display: none;">
        <div class="grm-settings-title">GRM Extension</div>
        <label class="grm-setting-row">
          <div class="grm-setting-info">
            <span class="grm-setting-name">Thread search</span>
            <span class="grm-setting-desc">Search all pages of the current thread</span>
          </div>
          <div class="grm-switch">
            <input type="checkbox" id="grm-setting-search">
            <span class="grm-switch-slider"></span>
          </div>
        </label>
        <label class="grm-setting-row">
          <div class="grm-setting-info">
            <span class="grm-setting-name">Auto-scroll to post</span>
            <span class="grm-setting-desc">Fix broken #post anchor links</span>
          </div>
          <div class="grm-switch">
            <input type="checkbox" id="grm-setting-scroll">
            <span class="grm-switch-slider"></span>
          </div>
        </label>
        <label class="grm-setting-row">
          <div class="grm-setting-info">
            <span class="grm-setting-name">Post link buttons</span>
            <span class="grm-setting-desc">Copy a direct link to any post</span>
          </div>
          <div class="grm-switch">
            <input type="checkbox" id="grm-setting-links">
            <span class="grm-switch-slider"></span>
          </div>
        </label>
        <label class="grm-setting-row">
          <div class="grm-setting-info">
            <span class="grm-setting-name">Show floating buttons</span>
            <span class="grm-setting-desc">Display gear and search icons on page</span>
          </div>
          <div class="grm-switch">
            <input type="checkbox" id="grm-setting-floating">
            <span class="grm-switch-slider"></span>
          </div>
        </label>
      </div>
      <div id="grm-search-panel" class="grm-search-panel" style="display: none;">
        <div class="grm-search-controls">
          <input type="text" id="grm-search-input" placeholder="Search this thread..." />
          <button id="grm-search-btn" class="grm-search-btn">Search</button>
        </div>
        <div class="grm-search-options">
          <label>
            <input type="checkbox" id="grm-case-sensitive" />
            Case sensitive
          </label>
          <label>
            <input type="checkbox" id="grm-whole-word" />
            Whole word
          </label>
          <label>
            <input type="checkbox" id="grm-current-page-only" />
            Current page only
          </label>
        </div>
        <div id="grm-search-status" class="grm-search-status"></div>
        <div id="grm-search-results" class="grm-search-results"></div>
      </div>
    `;

    document.body.appendChild(searchContainer);
  }

  function isThreadPage() {
    return window.location.pathname.includes('/forum/');
  }

  // Attach event listeners to search controls
  function openPanel() {
    const panel = document.getElementById('grm-search-panel');
    if (!panel) return;
    panel.style.display = 'block';
    constrainPanelToSidebar(panel);
  }

  function closePanel() {
    const panel = document.getElementById('grm-search-panel');
    if (panel) panel.style.display = 'none';
    document.body.style.paddingRight = '';
  }

  function constrainPanelToSidebar(panel) {
    document.body.style.paddingRight = '';
    const postList = document.querySelector('.postlist');
    if (!postList) return;
    let totalPadding = 0;
    for (let i = 0; i < 8; i++) {
      const overlap = postList.getBoundingClientRect().right - panel.getBoundingClientRect().left;
      if (overlap <= 0) break;
      totalPadding += Math.ceil(overlap);
      document.body.style.paddingRight = totalPadding + 'px';
    }
  }

  function closeSettingsPanel() {
    const panel = document.getElementById('grm-settings-panel');
    if (panel) panel.style.display = 'none';
  }

  async function attachEventListeners() {
    const settingsToggle = document.getElementById('grm-settings-toggle');
    const settingsPanel = document.getElementById('grm-settings-panel');
    const toggleBtn = document.getElementById('grm-search-toggle');
    const panel = document.getElementById('grm-search-panel');
    const searchInput = document.getElementById('grm-search-input');
    const searchBtn = document.getElementById('grm-search-btn');

    settingsToggle.addEventListener('click', () => {
      const isVisible = settingsPanel.style.display !== 'none';
      if (isVisible) {
        closeSettingsPanel();
      } else {
        closePanel();
        settingsPanel.style.display = 'block';
      }
    });

    // Sync checkbox states from saved settings
    const settings = await loadSettings();
    document.getElementById('grm-setting-search').checked   = settings.searchEnabled;
    document.getElementById('grm-setting-scroll').checked   = settings.scrollEnabled;
    document.getElementById('grm-setting-links').checked    = settings.linksEnabled;
    document.getElementById('grm-setting-floating').checked = settings.floatingEnabled;

    document.getElementById('grm-setting-search').addEventListener('change', async (e) => {
      const s = await loadSettings();
      s.searchEnabled = e.target.checked;
      saveSettings(s);
      toggleBtn.style.display = s.searchEnabled ? '' : 'none';
      if (!s.searchEnabled) closePanel();
    });

    document.getElementById('grm-setting-scroll').addEventListener('change', async (e) => {
      const s = await loadSettings();
      s.scrollEnabled = e.target.checked;
      saveSettings(s);
    });

    document.getElementById('grm-setting-links').addEventListener('change', async (e) => {
      const s = await loadSettings();
      s.linksEnabled = e.target.checked;
      saveSettings(s);
      if (s.linksEnabled) {
        addPostLinks();
      } else {
        document.querySelectorAll('.grm-post-link-btn').forEach(btn => btn.remove());
      }
    });

    document.getElementById('grm-setting-floating').addEventListener('change', async (e) => {
      const s = await loadSettings();
      s.floatingEnabled = e.target.checked;
      saveSettings(s);
      const header = document.querySelector('.grm-search-header');
      if (header) header.style.display = s.floatingEnabled ? '' : 'none';
    });

    toggleBtn.addEventListener('click', () => {
      const isVisible = panel.style.display !== 'none';
      if (isVisible) {
        closePanel();
      } else {
        closeSettingsPanel();
        openPanel();
        searchInput.focus();
      }
    });

    searchBtn.addEventListener('click', () => {
      performSearch(searchInput.value);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch(searchInput.value);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (panel.style.display !== 'none') closePanel();
        else if (settingsPanel.style.display !== 'none') closeSettingsPanel();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        if (panel.style.display !== 'none') {
          closePanel();
        } else {
          closeSettingsPanel();
          openPanel();
          searchInput.focus();
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#grm-thread-search')) {
        closePanel();
        closeSettingsPanel();
      }
    });

    window.addEventListener('resize', () => {
      const panel = document.getElementById('grm-search-panel');
      if (panel && panel.style.display !== 'none') constrainPanelToSidebar(panel);
    });
  }

  // Get all page URLs for this thread
  function getAllPageURLs() {
    const currentURL = window.location.href;

    // Extract thread ID and base URL pattern from current URL
    // URL format: /forum/grm/thread-title/96587/page1/
    const urlMatch = currentURL.match(/^(.*\/forum\/[^\/]+\/[^\/]+\/\d+\/)/);
    if (!urlMatch) {
      console.log('GRM Thread Search - Could not parse URL format');
      return [currentURL];
    }

    const baseURL = urlMatch[1];
    const threadIdMatch = currentURL.match(/\/(\d+)\//);
    const threadId = threadIdMatch ? threadIdMatch[1] : null;

    // Find the maximum page number from pagination
    const pagesDiv = document.querySelector('.pages');
    let maxPage = 1;

    if (pagesDiv) {
      // Look for all page links
      const pageLinks = pagesDiv.querySelectorAll('a[href*="/page"]');
      pageLinks.forEach(link => {
        const pageMatch = link.href.match(/\/page(\d+)\//);
        if (pageMatch) {
          const pageNum = parseInt(pageMatch[1]);
          if (pageNum > maxPage) {
            maxPage = pageNum;
          }
        }
      });

      // Also check for current page number
      const currentSpan = pagesDiv.querySelector('.current');
      if (currentSpan) {
        const currentPageNum = parseInt(currentSpan.textContent);
        if (!isNaN(currentPageNum) && currentPageNum > maxPage) {
          maxPage = currentPageNum;
        }
      }
    }

    // Generate all page URLs from 1 to maxPage
    const urls = [];
    for (let i = 1; i <= maxPage; i++) {
      urls.push(`${baseURL}page${i}/`);
    }

    console.log(`GRM Thread Search - Thread ${threadId}: Found ${maxPage} page(s)`);
    console.log('GRM Thread Search - Generated URLs:', urls.length > 10 ? `${urls.slice(0, 3).join(', ')} ... ${urls.slice(-2).join(', ')}` : urls);

    return urls;
  }

  // Fetch HTML content from a URL
  async function fetchPageContent(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      return doc;
    } catch (error) {
      console.error('Error fetching page:', url, error);
      return null;
    }
  }

  // Search for text in a document, tagging each result with its post author
  function searchInDocument(doc, searchTerm, caseSensitive, wholeWord) {
    const results = [];
    const searchRegex = createSearchRegex(searchTerm, caseSensitive, wholeWord);
    const postList = doc.querySelector('.postlist');
    const searchRoot = postList || doc.body;
    const postEls = searchRoot.querySelectorAll('.post');

    if (postEls.length > 0) {
      postEls.forEach((postEl, postIndex) => {
        const postAuthor = getPostAuthor(postEl, postIndex);
        collectTextMatches(doc, postEl, searchRegex, postIndex, postAuthor, results);
      });
    } else {
      collectTextMatches(doc, searchRoot, searchRegex, 0, null, results);
    }

    return results;
  }

  function getPostAuthor(postEl, fallbackIndex) {
    const selectors = [
      '.postername', '.username', '.post-author', '.author',
      'td.postername', 'td.username', 'a.username', 'span.username'
    ];
    for (const sel of selectors) {
      const el = postEl.querySelector(sel);
      if (el) {
        const name = el.textContent.trim();
        if (name) return name;
      }
    }
    return `Post ${fallbackIndex + 1}`;
  }

  function collectTextMatches(doc, root, searchRegex, postIndex, postAuthor, results) {
    const walker = doc.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          if (node.parentElement.tagName === 'SCRIPT' ||
              node.parentElement.tagName === 'STYLE' ||
              node.parentElement.tagName === 'NOSCRIPT') {
            return NodeFilter.FILTER_REJECT;
          }
          let parent = node.parentElement;
          while (parent) {
            if (parent.id === 'grm-thread-search') return NodeFilter.FILTER_REJECT;
            parent = parent.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      const text = node.nodeValue;
      if (!text || !text.trim()) continue;
      const globalRegex = new RegExp(searchRegex.source, searchRegex.flags);
      let match;
      while ((match = globalRegex.exec(text)) !== null) {
        const start = Math.max(0, match.index - 50);
        const end = Math.min(text.length, match.index + match[0].length + 50);
        results.push({
          text: match[0],
          context: text.substring(start, end),
          fullText: text,
          index: match.index,
          postIndex,
          postAuthor
        });
      }
    }
  }

  // Perform search across all pages
  async function performSearch(searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return;
    }

    if (isSearching) {
      console.log('Search already in progress');
      return;
    }

    isSearching = true;
    currentSearchTerm = searchTerm;
    searchResults = [];
    currentResultIndex = 0;

    // Clear any previously stored search results when starting a new search
    sessionStorage.removeItem('grm_search_results');
    sessionStorage.removeItem('grm_search_term');
    sessionStorage.removeItem('grm_search_options');
    sessionStorage.removeItem('grm_search_from_url');

    const caseSensitive = document.getElementById('grm-case-sensitive').checked;
    const wholeWord = document.getElementById('grm-whole-word').checked;
    const currentPageOnly = document.getElementById('grm-current-page-only').checked;

    const statusEl = document.getElementById('grm-search-status');
    const resultsEl = document.getElementById('grm-search-results');

    statusEl.textContent = 'Searching...';
    resultsEl.innerHTML = '';

    console.log('Starting search for:', searchTerm);

    try {
      if (currentPageOnly) {
        // Search only current page
        statusEl.textContent = 'Searching current page...';
        const results = searchInDocument(document, searchTerm, caseSensitive, wholeWord);
        searchResults.push({
          pageURL: window.location.href,
          pageNumber: getCurrentPageNumber(),
          results: results
        });
      } else {
        // Get all pages
        const pageURLs = getAllPageURLs();
        allPages = pageURLs;

        statusEl.textContent = `Found ${pageURLs.length} page(s). Searching...`;

        // Fetch and search all pages IN PARALLEL for much better performance
        let completedPages = 0;
        const searchPromises = pageURLs.map(async (url, index) => {
          try {
            const doc = await fetchPageContent(url);
            completedPages++;
            statusEl.textContent = `Searching... (${completedPages}/${pageURLs.length} pages loaded)`;

            if (doc) {
              const results = searchInDocument(doc, searchTerm, caseSensitive, wholeWord);
              if (results.length > 0) {
                return {
                  pageURL: url,
                  pageNumber: getPageNumberFromURL(url),
                  results: results
                };
              }
            }
            return null;
          } catch (error) {
            console.error('Error searching page:', url, error);
            return null;
          }
        });

        // Wait for all pages to complete
        const allResults = await Promise.all(searchPromises);

        // Filter out null results (pages with no matches or errors)
        searchResults = allResults.filter(r => r !== null);
      }

      // Display results
      displayResults();

      // Store search results and options for later restoration
      if (searchResults.length > 0) {
        sessionStorage.setItem('grm_search_results', JSON.stringify(searchResults));
        sessionStorage.setItem('grm_search_term', currentSearchTerm);
        sessionStorage.setItem('grm_search_options', JSON.stringify({
          caseSensitive: caseSensitive,
          wholeWord: wholeWord
        }));
        sessionStorage.setItem('grm_search_from_url', window.location.href);
      }

    } catch (error) {
      console.error('Search error:', error);
      statusEl.textContent = 'Search error: ' + error.message;
    } finally {
      isSearching = false;
    }
  }

  // Get current page number from URL
  function getCurrentPageNumber() {
    return getPageNumberFromURL(window.location.href);
  }

  // Extract page number from URL
  function getPageNumberFromURL(url) {
    const match = url.match(/\/page(\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
    const match2 = url.match(/[?&]page=(\d+)/);
    if (match2) {
      return parseInt(match2[1]);
    }
    return 1;
  }

  // Display search results
  function displayResults() {
    const statusEl = document.getElementById('grm-search-status');
    const resultsEl = document.getElementById('grm-search-results');

    // Count total matches
    const totalMatches = searchResults.reduce((sum, page) => sum + page.results.length, 0);

    if (totalMatches === 0) {
      statusEl.textContent = `No results found for "${currentSearchTerm}"`;
      resultsEl.innerHTML = '';
      return;
    }

    statusEl.textContent = `Found ${totalMatches} match(es) across ${searchResults.length} page(s)`;

    // Build results HTML
    let html = '<div class="grm-results-list">';

    searchResults.forEach(page => {
      html += `<div class="grm-page-results">`;
      html += `<div class="grm-page-header">Page ${page.pageNumber} (${page.results.length} match(es))</div>`;

      // Group the first 10 results by post, preserving idx so data-match-index
      // stays consistent with the sequential matchCount in highlightStoredSearch.
      const visibleResults = page.results.slice(0, 10);
      const postGroups = [];
      const seenPosts = new Map();
      visibleResults.forEach((result, idx) => {
        const key = result.postIndex ?? 0;
        if (!seenPosts.has(key)) {
          const group = { postAuthor: result.postAuthor || null, items: [] };
          seenPosts.set(key, group);
          postGroups.push(group);
        }
        seenPosts.get(key).items.push({ result, idx });
      });

      postGroups.forEach(group => {
        html += `<div class="grm-post-group">`;
        if (group.postAuthor) {
          html += `<div class="grm-post-group-header">${escapeHtml(group.postAuthor)}</div>`;
        }
        group.items.forEach(({ result, idx }) => {
          const contextPreview = escapeHtml(result.context)
            .replace(new RegExp(escapeRegex(result.text), 'gi'), '<mark>$&</mark>');
          html += `<div class="grm-result-item" data-url="${escapeHtml(page.pageURL)}" data-match-index="${idx}">`;
          html += `<div class="grm-result-context">${contextPreview}</div>`;
          html += `</div>`;
        });
        html += `</div>`;
      });

      if (page.results.length > 10) {
        html += `<div class="grm-more-results">... and ${page.results.length - 10} more match(es)</div>`;
      }

      html += `</div>`;
    });

    html += '</div>';

    resultsEl.innerHTML = html;

    // Add click handlers to results
    resultsEl.querySelectorAll('.grm-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.getAttribute('data-url');
        const matchIndex = item.getAttribute('data-match-index');
        if (url) {
          // Store search term, options, AND results in sessionStorage
          sessionStorage.setItem('grm_search_term', currentSearchTerm);
          sessionStorage.setItem('grm_search_options', JSON.stringify({
            caseSensitive: document.getElementById('grm-case-sensitive').checked,
            wholeWord: document.getElementById('grm-whole-word').checked
          }));
          // Store which specific match was clicked
          sessionStorage.setItem('grm_match_index', matchIndex);
          sessionStorage.setItem('grm_target_url', url);
          sessionStorage.setItem('grm_auto_reopen', 'true');
          // Store the complete search results to restore later
          sessionStorage.setItem('grm_search_results', JSON.stringify(searchResults));
          sessionStorage.setItem('grm_search_from_url', window.location.href);

          window.location.href = url;
        }
      });
    });
  }

  // Create search regex based on options
  function createSearchRegex(searchText, caseSensitive, wholeWord) {
    let pattern = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (wholeWord) {
      pattern = '\\b' + pattern + '\\b';
    }

    const flags = caseSensitive ? 'g' : 'gi';
    return new RegExp(pattern, flags);
  }

  // Escape HTML for display
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Escape regex special characters
  function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Restore search results if available
  function restoreSearchResults() {
    const storedResults = sessionStorage.getItem('grm_search_results');
    const storedTerm = sessionStorage.getItem('grm_search_term');
    const storedOptions = sessionStorage.getItem('grm_search_options');

    if (storedResults && storedTerm) {
      try {
        console.log('GRM Thread Search: Restoring previous search results');

        // Restore the search state
        currentSearchTerm = storedTerm;
        searchResults = JSON.parse(storedResults);

        // Only auto-reopen the panel when arriving via a result click;
        // manual navigation leaves the panel closed even if results exist.
        const autoReopen = sessionStorage.getItem('grm_auto_reopen');
        sessionStorage.removeItem('grm_auto_reopen');
        const panel = document.getElementById('grm-search-panel');
        if (panel && autoReopen === 'true') {
          openPanel();
        }

        // Restore search options
        if (storedOptions) {
          const options = JSON.parse(storedOptions);
          const caseSensitiveCheckbox = document.getElementById('grm-case-sensitive');
          const wholeWordCheckbox = document.getElementById('grm-whole-word');
          if (caseSensitiveCheckbox) caseSensitiveCheckbox.checked = options.caseSensitive;
          if (wholeWordCheckbox) wholeWordCheckbox.checked = options.wholeWord;
        }

        // Set the search input value
        const searchInput = document.getElementById('grm-search-input');
        if (searchInput) {
          searchInput.value = storedTerm;
        }

        // Display the results
        displayResults();

        // Scroll the results panel to the clicked item and mark it as active
        const targetURL = sessionStorage.getItem('grm_target_url');
        const targetMatchIndex = sessionStorage.getItem('grm_match_index');
        if (targetURL && targetMatchIndex !== null) {
          const resultsEl = document.getElementById('grm-search-results');
          if (resultsEl) {
            for (const item of resultsEl.querySelectorAll('.grm-result-item')) {
              if (item.getAttribute('data-url') === targetURL &&
                  item.getAttribute('data-match-index') === targetMatchIndex) {
                item.classList.add('grm-result-active');
                item.scrollIntoView({ block: 'nearest' });
                break;
              }
            }
          }
        }

      } catch (error) {
        console.error('GRM Thread Search: Error restoring search results:', error);
      }
    }
  }

  // Highlight search term on page if coming from search results
  function highlightStoredSearch() {
    const searchTerm = sessionStorage.getItem('grm_search_term');
    const searchOptionsJson = sessionStorage.getItem('grm_search_options');
    const targetMatchIndex = sessionStorage.getItem('grm_match_index');

    if (searchTerm) {
      console.log('GRM Thread Search: Found stored search term:', searchTerm);

      if (targetMatchIndex !== null) {
        console.log('GRM Thread Search: Target match index:', targetMatchIndex);
      }

      // DON'T clear the stored search - we want to keep it for going back
      // sessionStorage.removeItem('grm_search_term');
      // sessionStorage.removeItem('grm_search_options');

      try {
        const searchOptions = searchOptionsJson ? JSON.parse(searchOptionsJson) : {};
        const caseSensitive = searchOptions.caseSensitive || false;
        const wholeWord = searchOptions.wholeWord || false;
        const targetIndex = targetMatchIndex !== null ? parseInt(targetMatchIndex) : 0;

        // Find the postlist container
        const postList = document.querySelector('.postlist');
        if (!postList) {
          console.log('GRM Thread Search: Could not find .postlist container');
          return;
        }

        // Search for the term and highlight matches
        const searchRegex = createSearchRegex(searchTerm, caseSensitive, wholeWord);
        const walker = document.createTreeWalker(
          postList,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: function(node) {
              if (node.parentElement.tagName === 'SCRIPT' ||
                  node.parentElement.tagName === 'STYLE' ||
                  node.parentElement.tagName === 'NOSCRIPT') {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );

        // Phase 1: collect matching text nodes without touching the DOM.
        // replaceChild() detaches the current node, which causes walker.nextNode()
        // to return null immediately — so we must finish traversal before any replacements.
        const matchingNodes = [];
        let node;
        while (node = walker.nextNode()) {
          const text = node.nodeValue;
          if (!text || !text.trim()) continue;
          const testRegex = new RegExp(searchRegex.source, searchRegex.flags);
          if (testRegex.test(text)) matchingNodes.push(node);
        }

        // Phase 2: replace each matched text node with a highlighted fragment.
        let matchCount = 0;
        let targetHighlight = null;

        for (const textNode of matchingNodes) {
          if (!textNode.parentNode) continue;
          const text = textNode.nodeValue;
          const fragment = document.createDocumentFragment();
          let lastIndex = 0;
          const globalRegex = new RegExp(searchRegex.source, searchRegex.flags);
          let match;

          while ((match = globalRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
              fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }

            const highlight = document.createElement('span');
            highlight.className = 'grm-highlight';
            highlight.textContent = match[0];
            highlight.style.fontWeight = '500';
            highlight.style.borderRadius = '2px';

            if (matchCount === targetIndex) {
              highlight.classList.add('grm-current');
              highlight.style.backgroundColor = '#fb923c';
              highlight.style.color = 'white';
              highlight.style.padding = '2px 4px';
              targetHighlight = highlight;
            } else {
              highlight.style.backgroundColor = '#fef08a';
              highlight.style.color = '#854d0e';
              highlight.style.padding = '2px 0';
            }

            fragment.appendChild(highlight);
            matchCount++;
            lastIndex = match.index + match[0].length;
          }

          if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
          }

          textNode.parentNode.replaceChild(fragment, textNode);
        }

        // Scroll to the target match. The forum's own JS (ads, lazy images) shifts
        // layout after initial render, so we retry at increasing delays.
        if (targetHighlight) {
          const scrollToTarget = () => {
            targetHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
          };
          setTimeout(scrollToTarget, 100);
          setTimeout(scrollToTarget, 600);
          setTimeout(scrollToTarget, 1500);
          if (document.readyState !== 'complete') {
            window.addEventListener('load', () => setTimeout(scrollToTarget, 200), { once: true });
          }
        }

      } catch (error) {
        console.error('GRM Thread Search: Error highlighting stored search:', error);
      }
    }
  }

  const LINK_ICON_SVG = `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
    <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
    <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
  </svg>`;

  const CHECK_ICON_SVG = `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
  </svg>`;

  // Inject a small copy-link button onto each post
  function addPostLinks() {
    const postList = document.querySelector('.postlist');
    if (!postList) return;

    postList.querySelectorAll('.post').forEach((postEl, fallbackIndex) => {
      // The anchor ID may be on the .post element itself or on a child element
      let postId = /^post\d+$/.test(postEl.id) ? postEl.id : null;
      if (!postId) {
        const anchor = postEl.querySelector('[id^="post"]');
        if (anchor && /^post\d+$/.test(anchor.id)) postId = anchor.id;
      }
      if (!postId) return;

      const url = window.location.origin + window.location.pathname +
                  window.location.search + '#' + postId;

      // Establish a positioning context on the post container.
      // For table rows use the first TD instead, since TR ignores position:relative.
      const container = postEl.tagName === 'TR'
        ? (postEl.querySelector('td') || postEl)
        : postEl;
      if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
      }

      const btn = document.createElement('button');
      btn.className = 'grm-post-link-btn';
      btn.title = 'Copy link to this post';
      btn.innerHTML = LINK_ICON_SVG;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const copied = () => {
          btn.innerHTML = CHECK_ICON_SVG;
          btn.classList.add('grm-post-link-copied');
          setTimeout(() => {
            btn.innerHTML = LINK_ICON_SVG;
            btn.classList.remove('grm-post-link-copied');
          }, 2000);
        };
        navigator.clipboard.writeText(url).then(copied).catch(() => {
          // Fallback for browsers without clipboard API access
          const ta = document.createElement('textarea');
          ta.value = url;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copied();
        });
      });

      container.appendChild(btn);
    });
  }

  // Re-scroll to a #postNNNNNN anchor after GRM's JS finishes shifting the layout.
  // The browser's native anchor scroll fires before ads/images load, so it gets displaced.
  // scroll-margin-top on the post elements handles the fixed-header offset (see styles.css).
  function scrollToAnchorPost() {
    const hash = window.location.hash;
    if (!hash || !/^#post\d+$/.test(hash)) return;

    const target = document.querySelector(hash);
    if (!target) return;

    const scroll = () => target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(scroll, 100);
    setTimeout(scroll, 600);
    setTimeout(scroll, 1500);
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => setTimeout(scroll, 200), { once: true });
    }
  }

  // Message listener — lets the popup drive in-page panels and sync settings
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'openSearch') {
      const panel = document.getElementById('grm-search-panel');
      if (panel) {
        closeSettingsPanel();
        openPanel();
        setTimeout(() => document.getElementById('grm-search-input')?.focus(), 50);
      }
    } else if (message.action === 'applySetting') {
      const { key, value } = message;
      // Keep in-page checkboxes in sync with popup
      const checkboxMap = {
        searchEnabled:  'grm-setting-search',
        scrollEnabled:  'grm-setting-scroll',
        linksEnabled:   'grm-setting-links',
        floatingEnabled:'grm-setting-floating',
      };
      const cb = document.getElementById(checkboxMap[key]);
      if (cb) cb.checked = value;

      if (key === 'searchEnabled') {
        const btn = document.getElementById('grm-search-toggle');
        if (btn) btn.style.display = value ? '' : 'none';
        if (!value) closePanel();
      } else if (key === 'linksEnabled') {
        if (value) addPostLinks();
        else document.querySelectorAll('.grm-post-link-btn').forEach(b => b.remove());
      } else if (key === 'floatingEnabled') {
        const header = document.querySelector('.grm-search-header');
        if (header) header.style.display = value ? '' : 'none';
      }
    }
    return false;
  });

  // Initialize the extension
  function init() {
    const setup = async () => {
      const settings = await loadSettings();
      createSearchUI();
      await attachEventListeners();

      if (!settings.searchEnabled) {
        document.getElementById('grm-search-toggle').style.display = 'none';
      }
      if (!settings.floatingEnabled) {
        const header = document.querySelector('.grm-search-header');
        if (header) header.style.display = 'none';
      }
      if (settings.searchEnabled) {
        restoreSearchResults();
        highlightStoredSearch();
      }
      if (settings.scrollEnabled) scrollToAnchorPost();
      if (settings.linksEnabled) addPostLinks();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }

  init();
})();
