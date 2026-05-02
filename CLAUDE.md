# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser extension (Chrome/Edge/Brave/Firefox) that adds multi-page search to Grassroots Motorsports (GRM) forum threads. It is a pure vanilla JS content script — no build system, no npm, no dependencies.

## Development Workflow

No build step required. Edit source files, then reload the unpacked extension in the browser:

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select this directory
4. After edits, click the reload icon on the extension card
5. Refresh the target page to pick up content script changes

The extension only activates on `https://grassrootsmotorsports.com/forum/*` (enforced by `manifest.json` `matches` pattern and `isThreadPage()` in `content.js`).

## Architecture

**Entry point:** `content.js` is injected at `document_end` on matching pages.

**Core pipeline:**

1. `init()` — checks `isThreadPage()`, creates UI, restores any persisted search state
2. `performSearch()` — fetches all thread pages in parallel (`Promise.all`), calls `searchInDocument()` on each, aggregates results
3. `searchInDocument(doc)` — walks text nodes via `TreeWalker`, applies regex matching (case/whole-word options), extracts 50-char context snippets
4. `displayResults()` — renders grouped results by page; limits to 10 visible matches per page
5. **Result click** → stores target match index + search query in `sessionStorage` → navigates to target page URL
6. On next page load: `restoreSearchResults()` reopens panel with prior results; `highlightStoredSearch()` highlights matches and scrolls to the specific clicked match

**State persistence:** `sessionStorage` keys `grm_search_results`, `grm_search_query`, `grm_target_match`, `grm_target_page` carry search state across page navigations within the same tab.

**Scope restriction:** Text search only runs inside `.postlist` to avoid ads and navigation elements.

## Key Files

- `manifest.json` — Manifest V3; only `activeTab` permission; single content script entry
- `content.js` — All extension logic (~634 lines); no external dependencies
- `styles.css` — Search panel styles; includes dark mode (`prefers-color-scheme`) and mobile breakpoints
- `icon.svg` — Source icon; must be converted to `icon48.png` / `icon128.png` for production (see `ICONS.md`)

## Icon Setup

PNG icons are required for the extension to load without warnings. Three options are documented in `ICONS.md`: convert the SVG via Inkscape/ImageMagick, create custom PNGs, or use an online generator.
