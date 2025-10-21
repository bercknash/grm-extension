# GRM Forum Thread Search

A browser extension that adds powerful **multi-page search functionality** to the Grassroots Motorsports forum (https://grassrootsmotorsports.com/forum/).

## Features

- **Multi-Page Search**: Search across **ALL pages** of a thread automatically - no need to manually check each page!
- **Smart Results**: Results are organized by page number with clickable previews
- **Context Preview**: See the surrounding text for each match
- **Progress Indicator**: Watch as the extension searches through each page
- **Search Options**:
  - Case-sensitive search
  - Whole word matching
  - Current page only mode (for faster searches)
- **Keyboard Shortcuts**:
  - `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac): Open search panel
  - `Enter`: Start search
  - `Esc`: Close search panel
- **Clean UI**: Minimal, non-intrusive floating search interface
- **Dark Mode**: Automatically adapts to your system's dark mode preference
- **Click to Navigate**: Click any result to jump to that page

## Why This Extension?

Forum threads can have hundreds of posts across dozens of pages. Finding specific information without this extension means:
- Opening every page manually
- Using browser find (Ctrl+F) on each page individually
- Losing track of which pages you've checked

This extension solves all that by **automatically fetching and searching every page** in the thread for you!

## Installation

### Chrome/Edge/Brave

1. Download or clone this repository to your computer
2. Open Chrome/Edge/Brave and navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked"
5. Select the folder containing the extension files
6. The extension is now installed and active!

### Firefox

1. Download or clone this repository to your computer
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Navigate to the extension folder and select the `manifest.json` file
5. The extension is now installed and active!

Note: In Firefox, temporary extensions are removed when you close the browser. For permanent installation, you would need to package and sign the extension.

## Usage

### Basic Search (All Pages)

1. Navigate to any thread on the Grassroots Motorsports forum
2. You'll see a blue search button in the top-right corner of the page
3. Click the search button or press `Ctrl+Shift+F` (`Cmd+Shift+F` on Mac) to open the search panel
4. Type your search term in the input field and click "Search" or press Enter
5. The extension will:
   - Detect all pages in the thread
   - Fetch and search each page
   - Display progress as it searches
   - Show all results organized by page number
6. Click on any result to navigate to that page

### Current Page Only

If you just want to search the current page (faster):
1. Check the "Current page only" checkbox
2. Enter your search term and click "Search"
3. Results will only include matches from the current page

### Search Options

- **Case sensitive**: Match exact letter case
- **Whole word**: Only match complete words (e.g., "car" won't match "cars")
- **Current page only**: Skip multi-page search, only search current page

## How It Works

The extension:
1. Detects you're on a GRM forum thread page
2. When you search, it finds all pagination links in the thread
3. Fetches the HTML content from each page
4. Searches through all text content on each page
5. Displays results with context previews and page numbers
6. Allows you to click results to navigate to that specific page

All searches happen locally in your browser - **no data is sent to any external servers**.

## Examples

**Searching for a specific car model:**
- Search for "Miata" across a 15-page build thread
- Get all mentions with context
- Click to jump to the exact page where someone discussed it

**Finding technical information:**
- Search for "torque spec" in a long technical thread
- See all instances across all pages
- Quickly navigate to the relevant discussions

**Tracking project updates:**
- Search for "update" in a project thread
- See chronological progress across all pages
- Click through to read detailed updates

## Performance

- **Current page only**: Nearly instant
- **Multi-page search**: Depends on number of pages (typically 1-3 seconds per page)
- The extension shows progress as it searches
- Results appear as soon as all pages are searched

## Troubleshooting

**Search button doesn't appear:**
- Make sure you're on a forum thread page (not the forum list)
- Try refreshing the page
- Check if the extension is enabled in your browser's extension settings

**Search is slow:**
- For very long threads (20+ pages), multi-page search will take time
- Use "Current page only" mode for faster results if you know which page to check
- The extension shows progress, so you know it's working

**No results found:**
- Check your spelling
- Try without "Case sensitive" or "Whole word" options
- Make sure you're on a thread page with posts

## Privacy

This extension:
- **Does NOT** collect any data
- **Does NOT** make any external network requests (except to fetch forum pages from grassrootsmotorsports.com)
- Only runs on grassrootsmotorsports.com forum pages
- All search operations happen locally in your browser
- **Does NOT** modify or store any forum content
- **Does NOT** track your searches or browsing

## Customization

You can customize the extension by editing the files:

- `styles.css`: Modify colors, sizes, and positioning of the search UI
- `content.js`: Adjust search behavior, selectors, or add new features
- `manifest.json`: Change extension name, permissions, or other metadata

## Development

To modify the extension:

1. Make changes to the source files
2. If the extension is already loaded:
   - **Chrome/Edge**: Go to `chrome://extensions/` and click the reload icon
   - **Firefox**: Go to `about:debugging` and click "Reload"
3. Refresh any forum pages where you want to test the changes

## License

MIT License - Feel free to modify and distribute as needed.

## Contributing

Found a bug or have a feature request? Please open an issue or submit a pull request!

## Version History

### 2.0.0 (Multi-Page Search)
- **NEW**: Search across all pages in a thread automatically
- **NEW**: Results organized by page number
- **NEW**: Click results to navigate to specific pages
- **NEW**: Progress indicator while searching
- **NEW**: "Current page only" mode for faster searches
- **NEW**: Context previews for each match
- Completely rewritten search engine
- Improved UI with results display
- Better performance and reliability

### 1.0.0 (Initial Release)
- In-thread search functionality
- Real-time highlighting
- Navigation between results
- Case-sensitive and whole-word search options
- Keyboard shortcuts
- Dark mode support
