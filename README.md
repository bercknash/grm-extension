# GRM Forum Thread Search

A browser extension that adds powerful in-thread search functionality to the Grassroots Motorsports forum (https://grassrootsmotorsports.com/forum/).

## Features

- **In-Thread Search**: Search through all posts within a forum thread, even if the thread has hundreds of posts
- **Real-time Highlighting**: All matching text is highlighted as you type
- **Navigation**: Easily navigate between search results with previous/next buttons or keyboard shortcuts
- **Search Options**:
  - Case-sensitive search
  - Whole word matching
- **Keyboard Shortcuts**:
  - `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac): Open search panel
  - `Enter`: Navigate to next result
  - `Shift+Enter`: Navigate to previous result
  - `Esc`: Close search panel
- **Clean UI**: Minimal, non-intrusive floating search interface
- **Dark Mode**: Automatically adapts to your system's dark mode preference

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

1. Navigate to any thread on the Grassroots Motorsports forum (e.g., `https://grassrootsmotorsports.com/forum/...`)
2. You'll see a blue search button in the top-right corner of the page
3. Click the search button or press `Ctrl+Shift+F` (`Cmd+Shift+F` on Mac) to open the search panel
4. Type your search term in the input field
5. Results will be highlighted in yellow, with the current result in orange
6. Use the up/down arrow buttons or Enter/Shift+Enter to navigate between results
7. Toggle "Case sensitive" or "Whole word" options as needed
8. Click the X button to clear the search

## How It Works

The extension:
- Only activates on Grassroots Motorsports forum pages
- Scans all posts on the current thread page
- Highlights matching text without modifying the original page content
- Automatically scrolls to center the current match in view
- Works with the forum's existing structure without requiring any changes

## Customization

You can customize the extension by editing the files:

- `styles.css`: Modify colors, sizes, and positioning of the search UI
- `content.js`: Adjust search behavior, selectors, or add new features
- `manifest.json`: Change extension name, permissions, or other metadata

## Troubleshooting

**Search button doesn't appear:**
- Make sure you're on a forum thread page (not the forum list)
- Try refreshing the page
- Check if the extension is enabled in your browser's extension settings

**No results found:**
- The forum may use different HTML structure than expected
- Open the browser console (F12) and look for any error messages
- The extension may need to be updated with correct selectors for the forum's structure

**Search is slow:**
- For very long threads (hundreds of posts), the initial search may take a moment
- Searches are debounced (delayed by 300ms) to improve performance while typing

## Development

To modify the extension:

1. Make changes to the source files
2. If the extension is already loaded:
   - **Chrome/Edge**: Go to `chrome://extensions/` and click the reload icon
   - **Firefox**: Go to `about:debugging` and click "Reload"
3. Refresh any forum pages where you want to test the changes

## Privacy

This extension:
- Does NOT collect any data
- Does NOT make any external network requests
- Only runs on grassrootsmotorsports.com forum pages
- All search operations happen locally in your browser
- Does NOT modify or store any forum content

## License

MIT License - Feel free to modify and distribute as needed.

## Contributing

Found a bug or have a feature request? Please open an issue or submit a pull request!

## Version History

### 1.0.0 (Initial Release)
- In-thread search functionality
- Real-time highlighting
- Navigation between results
- Case-sensitive and whole-word search options
- Keyboard shortcuts
- Dark mode support
