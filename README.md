# GRM Forum Extension

A browser extension that adds quality-of-life enhancements to the [Grassroots Motorsports forum](https://grassrootsmotorsports.com/forum/).

## Features

### Multi-Page Thread Search
Search across every page of a thread at once. The extension fetches all pages in parallel, finds every match, and displays results grouped by post author. Click any result to jump directly to that match.

- Case-sensitive and whole-word search options
- Results show surrounding context for each match
- Current-page-only mode for faster single-page searches
- `Ctrl+Shift+F` / `Cmd+Shift+F` to open, `Esc` to close

### Post Anchor Scroll Fix
GRM's `#postNNNNNN` links (used in "last post" links and bookmarks) often land on the wrong spot due to the site's fixed header. This extension automatically corrects the scroll position so the post header is always visible.

### Per-Post Copy Link
A small link icon appears when you hover over any post. Click it to copy a direct URL to that post to your clipboard.

## Installation

### Chrome / Edge / Brave

1. Download or clone this repository
2. Go to `chrome://extensions/` (or `edge://extensions/`)
3. Enable **Developer mode**
4. Click **Load unpacked** and select the extension folder

### Firefox

1. Download or clone this repository
2. Go to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on** and select `manifest.json`

> Firefox temporary add-ons are removed when the browser closes. For permanent installation, the extension would need to be packaged and signed.

## Settings

Click the **GRM** toolbar button to access settings. Each feature can be enabled or disabled independently. You can also hide the floating gear and search buttons from the page if you prefer to access search only from the toolbar.

## Privacy

- Runs only on `grassrootsmotorsports.com/forum/*`
- Makes no external network requests (page fetches go to GRM itself)
- Stores only your feature toggle preferences, locally in the browser
- Collects no data

## Version History

### 2.1.0
- Added toolbar popup with per-feature toggles and "Search in Thread" button
- Added option to hide floating gear/search buttons
- Migrated settings to `chrome.storage.local` for popup/page sync
- Renamed to GRM Forum Extension

### 2.0.0
- Multi-page thread search with parallel page fetching
- Results grouped by post author
- Click-to-navigate with scroll-to-match
- Post copy-link buttons
- Post anchor scroll fix
- Per-feature settings panel
- Dark mode support

### 1.0.0
- Initial release: single-page search with real-time highlighting
