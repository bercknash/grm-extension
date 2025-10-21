// GRM Forum Thread Search Extension v2.0.0
// Adds in-thread search functionality across all pages of Grassroots Motorsports forum

console.log('GRM Thread Search: Script loaded!');
console.log('GRM Thread Search: Current URL:', window.location.href);

(function() {
  'use strict';

  console.log('GRM Thread Search: Inside IIFE');

  // Only run on thread pages
  if (!isThreadPage()) {
    console.log('GRM Thread Search: Not a thread page, exiting');
    return;
  }

  console.log('GRM Thread Search: Is a thread page, initializing...');

  let currentSearchTerm = '';
  let searchResults = [];
  let currentResultIndex = 0;
  let allPages = [];
  let isSearching = false;

  // Create and inject the search UI
  function createSearchUI() {
    const searchContainer = document.createElement('div');
    searchContainer.id = 'grm-thread-search';
    searchContainer.innerHTML = `
      <div class="grm-search-header">
        <button id="grm-search-toggle" class="grm-toggle-btn" title="Toggle Search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
        </button>
      </div>
      <div id="grm-search-panel" class="grm-search-panel" style="display: none;">
        <div class="grm-search-controls">
          <input type="text" id="grm-search-input" placeholder="Search across all pages..." />
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
    attachEventListeners();
  }

  // Check if we're on a thread page
  function isThreadPage() {
    const isForumPage = window.location.pathname.includes('/forum/');
    console.log('GRM Thread Search: Checking if thread page');
    console.log('- URL:', window.location.href);
    console.log('- Is forum page:', isForumPage);
    return isForumPage;
  }

  // Attach event listeners to search controls
  function attachEventListeners() {
    const toggleBtn = document.getElementById('grm-search-toggle');
    const panel = document.getElementById('grm-search-panel');
    const searchInput = document.getElementById('grm-search-input');
    const searchBtn = document.getElementById('grm-search-btn');

    toggleBtn.addEventListener('click', () => {
      const isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        searchInput.focus();
      }
    });

    searchBtn.addEventListener('click', () => {
      performSearch(searchInput.value);
    });

    // Keyboard shortcuts
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch(searchInput.value);
      } else if (e.key === 'Escape') {
        panel.style.display = 'none';
      }
    });

    // Global keyboard shortcut: Ctrl+Shift+F or Cmd+Shift+F
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        panel.style.display = 'block';
        searchInput.focus();
      }
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

  // Search for text in a document
  function searchInDocument(doc, searchTerm, caseSensitive, wholeWord) {
    const results = [];
    const searchRegex = createSearchRegex(searchTerm, caseSensitive, wholeWord);

    // GRM forum: posts are in .post elements, content in .post .content
    // Search within the .postlist container to avoid navigation/ads
    const postList = doc.querySelector('.postlist');
    const searchRoot = postList || doc.body;

    // Walk through all text nodes
    const walker = doc.createTreeWalker(
      searchRoot,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip script, style, noscript
          if (node.parentElement.tagName === 'SCRIPT' ||
              node.parentElement.tagName === 'STYLE' ||
              node.parentElement.tagName === 'NOSCRIPT') {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip our own search UI (when searching current page)
          let parent = node.parentElement;
          while (parent) {
            if (parent.id === 'grm-thread-search') {
              return NodeFilter.FILTER_REJECT;
            }
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

      let match;
      const globalRegex = new RegExp(searchRegex.source, searchRegex.flags);
      while ((match = globalRegex.exec(text)) !== null) {
        // Get context around the match
        const start = Math.max(0, match.index - 50);
        const end = Math.min(text.length, match.index + match[0].length + 50);
        const context = text.substring(start, end);

        results.push({
          text: match[0],
          context: context,
          fullText: text,
          index: match.index
        });
      }
    }

    return results;
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

      page.results.slice(0, 10).forEach((result, idx) => {
        const contextPreview = escapeHtml(result.context)
          .replace(
            new RegExp(escapeRegex(result.text), 'gi'),
            '<mark>$&</mark>'
          );

        html += `<div class="grm-result-item" data-url="${escapeHtml(page.pageURL)}">`;
        html += `<div class="grm-result-context">${contextPreview}</div>`;
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
        if (url) {
          // Store search term, options, AND results in sessionStorage
          sessionStorage.setItem('grm_search_term', currentSearchTerm);
          sessionStorage.setItem('grm_search_options', JSON.stringify({
            caseSensitive: document.getElementById('grm-case-sensitive').checked,
            wholeWord: document.getElementById('grm-whole-word').checked
          }));
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

        // Open the search panel
        const panel = document.getElementById('grm-search-panel');
        if (panel) {
          panel.style.display = 'block';
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

      } catch (error) {
        console.error('GRM Thread Search: Error restoring search results:', error);
      }
    }
  }

  // Highlight search term on page if coming from search results
  function highlightStoredSearch() {
    const searchTerm = sessionStorage.getItem('grm_search_term');
    const searchOptionsJson = sessionStorage.getItem('grm_search_options');

    if (searchTerm) {
      console.log('GRM Thread Search: Found stored search term:', searchTerm);

      // DON'T clear the stored search - we want to keep it for going back
      // sessionStorage.removeItem('grm_search_term');
      // sessionStorage.removeItem('grm_search_options');

      try {
        const searchOptions = searchOptionsJson ? JSON.parse(searchOptionsJson) : {};
        const caseSensitive = searchOptions.caseSensitive || false;
        const wholeWord = searchOptions.wholeWord || false;

        // Find the postlist container
        const postList = document.querySelector('.postlist');
        if (!postList) {
          console.log('GRM Thread Search: Could not find .postlist container');
          return;
        }

        // Search for the term and highlight first match
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

        let foundFirst = false;
        let node;
        while (node = walker.nextNode()) {
          const text = node.nodeValue;
          if (!text || !searchRegex.test(text)) continue;

          // Highlight this text node
          const fragment = document.createDocumentFragment();
          let lastIndex = 0;
          let match;
          const globalRegex = new RegExp(searchRegex.source, searchRegex.flags + (searchRegex.flags.includes('g') ? '' : 'g'));

          while ((match = globalRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
              fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }

            const highlight = document.createElement('span');
            highlight.className = 'grm-highlight grm-current';
            highlight.textContent = match[0];
            highlight.style.backgroundColor = '#fb923c';
            highlight.style.color = 'white';
            highlight.style.fontWeight = '500';
            highlight.style.padding = '2px 4px';
            highlight.style.borderRadius = '2px';
            fragment.appendChild(highlight);

            // Scroll to first match
            if (!foundFirst) {
              foundFirst = true;
              setTimeout(() => {
                highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            }

            lastIndex = match.index + match[0].length;
          }

          if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
          }

          node.parentNode.replaceChild(fragment, node);
        }

      } catch (error) {
        console.error('GRM Thread Search: Error highlighting stored search:', error);
      }
    }
  }

  // Initialize the extension
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        createSearchUI();
        restoreSearchResults();  // Restore search results first
        highlightStoredSearch();  // Then highlight matches on the page
      });
    } else {
      createSearchUI();
      restoreSearchResults();
      highlightStoredSearch();
    }
  }

  init();
})();
