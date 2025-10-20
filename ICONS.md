# Icon Setup Instructions

The extension requires two icon files:
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

## Quick Setup Options

### Option 1: Use the SVG Icon (Recommended for Development)

Use the included `icon.svg` file and convert it to PNG:

1. Open `icon.svg` in a browser or image editor
2. Export/save as PNG at 48x48 and 128x128 pixels
3. Save as `icon48.png` and `icon128.png`

### Option 2: Create Your Own Icons

Create two PNG files with a search magnifying glass icon:
- Simple magnifying glass design
- Blue color scheme (matching the extension UI)
- Transparent background
- Square dimensions (48x48 and 128x128)

### Option 3: Online Icon Generator

Use a free icon generator:
1. Visit https://www.favicon-generator.org/
2. Upload the `icon.svg` file
3. Download the generated icons
4. Rename them to `icon48.png` and `icon128.png`

## Temporary Workaround

If you want to test the extension without icons:

1. Edit `manifest.json`
2. Remove or comment out the `"icons"` section
3. The extension will work but won't have a custom icon in the browser toolbar

The extension will still function perfectly without custom icons - they're only for visual identification in the browser's extension menu.
