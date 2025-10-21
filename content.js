// GRM Forum Thread Search Extension
// Adds in-thread search functionality to Grassroots Motorsports forum

(function() {
  'use strict';

  // Only run on thread pages
  if (!isThreadPage()) {
    return;
  }

  let currentSearchTerm = '';
  let currentMatchIndex = 0;
  let matches = [];

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
          <input type="text" id="grm-search-input" placeholder="Search in thread..." />
          <button id="grm-search-prev" class="grm-nav-btn" title="Previous" disabled>↑</button>
          <button id="grm-search-next" class="grm-nav-btn" title="Next" disabled>↓</button>
          <span id="grm-search-count" class="grm-search-count">0/0</span>
          <button id="grm-search-clear" class="grm-clear-btn" title="Clear">✕</button>
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
        </div>
      </div>
    `;

    document.body.appendChild(searchContainer);
    attachEventListeners();
  }

  // Check if we're on a thread page
  function isThreadPage() {
    // Thread pages typically have multiple posts
    // For now, just check if we're on any forum page - we'll refine this later
    const isForumPage = window.location.pathname.includes('/forum/');
    console.log('GRM Thread Search: Checking if thread page');
    console.log('- URL:', window.location.href);
    console.log('- Is forum page:', isForumPage);

    // Run on all forum pages - we'll check for posts when searching
    return isForumPage;
  }

  // Attach event listeners to search controls
  function attachEventListeners() {
    const toggleBtn = document.getElementById('grm-search-toggle');
    const panel = document.getElementById('grm-search-panel');
    const searchInput = document.getElementById('grm-search-input');
    const prevBtn = document.getElementById('grm-search-prev');
    const nextBtn = document.getElementById('grm-search-next');
    const clearBtn = document.getElementById('grm-search-clear');
    const caseSensitive = document.getElementById('grm-case-sensitive');
    const wholeWord = document.getElementById('grm-whole-word');

    toggleBtn.addEventListener('click', () => {
      const isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        searchInput.focus();
      }
    });

    searchInput.addEventListener('input', debounce(() => {
      performSearch(searchInput.value);
    }, 300));

    prevBtn.addEventListener('click', () => navigateMatches(-1));
    nextBtn.addEventListener('click', () => navigateMatches(1));

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearch();
    });

    caseSensitive.addEventListener('change', () => {
      if (searchInput.value) {
        performSearch(searchInput.value);
      }
    });

    wholeWord.addEventListener('change', () => {
      if (searchInput.value) {
        performSearch(searchInput.value);
      }
    });

    // Keyboard shortcuts
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        navigateMatches(e.shiftKey ? -1 : 1);
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

  // Perform search in thread posts
  function performSearch(searchTerm) {
    clearSearch();

    if (!searchTerm || searchTerm.trim().length === 0) {
      return;
    }

    currentSearchTerm = searchTerm;
    const caseSensitive = document.getElementById('grm-case-sensitive').checked;
    const wholeWord = document.getElementById('grm-whole-word').checked;

    console.log('GRM Thread Search - Searching for:', searchTerm);

    // Search the entire document body (excluding our search UI)
    // This works with any forum structure
    const searchRoot = document.body;

    highlightTextInElement(searchRoot, searchTerm, caseSensitive, wholeWord);

    // Collect all matches
    matches = Array.from(document.querySelectorAll('.grm-highlight'));

    console.log('- Matches found:', matches.length);

    updateMatchCount();

    if (matches.length > 0) {
      currentMatchIndex = 0;
      highlightCurrentMatch();
      scrollToMatch(matches[0]);
    } else {
      console.log('No matches found for:', searchTerm);
    }
  }

  // Highlight text in an element
  function highlightTextInElement(element, searchText, caseSensitive, wholeWord) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip script, style, and already highlighted elements
          if (node.parentElement.tagName === 'SCRIPT' ||
              node.parentElement.tagName === 'STYLE' ||
              node.parentElement.tagName === 'NOSCRIPT' ||
              node.parentElement.classList.contains('grm-highlight')) {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip our own search UI
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

    const nodesToHighlight = [];
    let node;

    while (node = walker.nextNode()) {
      const text = node.nodeValue;
      if (!text || !text.trim()) continue;

      const searchRegex = createSearchRegex(searchText, caseSensitive, wholeWord);
      if (searchRegex.test(text)) {
        nodesToHighlight.push(node);
      }
    }

    // Replace text nodes with highlighted versions
    nodesToHighlight.forEach(node => {
      const text = node.nodeValue;
      const searchRegex = createSearchRegex(searchText, caseSensitive, wholeWord);

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      // Reset regex
      const globalRegex = new RegExp(searchRegex.source, searchRegex.flags + (searchRegex.flags.includes('g') ? '' : 'g'));

      while ((match = globalRegex.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }

        // Add highlighted match
        const highlight = document.createElement('span');
        highlight.className = 'grm-highlight';
        highlight.textContent = match[0];
        fragment.appendChild(highlight);

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      node.parentNode.replaceChild(fragment, node);
    });
  }

  // Create search regex based on options
  function createSearchRegex(searchText, caseSensitive, wholeWord) {
    let pattern = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special chars

    if (wholeWord) {
      pattern = '\\b' + pattern + '\\b';
    }

    const flags = caseSensitive ? 'g' : 'gi';
    return new RegExp(pattern, flags);
  }

  // Navigate between matches
  function navigateMatches(direction) {
    if (matches.length === 0) return;

    // Remove current highlight
    if (matches[currentMatchIndex]) {
      matches[currentMatchIndex].classList.remove('grm-current');
    }

    // Update index
    currentMatchIndex += direction;

    if (currentMatchIndex < 0) {
      currentMatchIndex = matches.length - 1;
    } else if (currentMatchIndex >= matches.length) {
      currentMatchIndex = 0;
    }

    highlightCurrentMatch();
    scrollToMatch(matches[currentMatchIndex]);
    updateMatchCount();
  }

  // Highlight the current match
  function highlightCurrentMatch() {
    if (matches[currentMatchIndex]) {
      matches[currentMatchIndex].classList.add('grm-current');
    }
  }

  // Scroll to a match
  function scrollToMatch(element) {
    if (!element) return;

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

  // Update match count display
  function updateMatchCount() {
    const countElement = document.getElementById('grm-search-count');
    const prevBtn = document.getElementById('grm-search-prev');
    const nextBtn = document.getElementById('grm-search-next');

    if (matches.length > 0) {
      countElement.textContent = `${currentMatchIndex + 1}/${matches.length}`;
      prevBtn.disabled = false;
      nextBtn.disabled = false;
    } else {
      countElement.textContent = '0/0';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    }
  }

  // Clear all search highlights
  function clearSearch() {
    const highlights = document.querySelectorAll('.grm-highlight');
    highlights.forEach(highlight => {
      const text = highlight.textContent;
      const textNode = document.createTextNode(text);
      highlight.parentNode.replaceChild(textNode, highlight);
    });

    // Merge adjacent text nodes
    document.body.normalize();

    matches = [];
    currentMatchIndex = 0;
    currentSearchTerm = '';
    updateMatchCount();
  }

  // Debounce function for search input
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Initialize the extension
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createSearchUI);
    } else {
      createSearchUI();
    }
  }

  init();
})();
