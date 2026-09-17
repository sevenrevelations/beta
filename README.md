# blobby.vip

A customizable browser-controller UI built for GitHub Pages and MIT App Inventor.

## What changed in this build

- App Inventor bridge using `window.AppInventor.setWebViewString()`
- No iframe-based external browsing in the final app architecture
- Desktop/GitHub demo mode with external-open fallback
- Multi-tab UI with per-tab URL history and restore
- Back, Forward, Refresh, Home, address/search bar
- 19 built-in themes
- Full custom theme editor for background, panels, text, accents, borders, and glow
- Custom theme save, rename, duplicate, delete, export, and import
- RGB mode with selectable RGB zones
- Ambient effects: snow, rain, stars, particles, fireflies, floating orbs, aurora, fog, Matrix rain, bubbles, shooting stars, gradient waves, RGB glow, and dust
- Rain lightning and glass ambience
- Effect density, speed, opacity, and size controls
- Performance mode
- Solid, gradient, image URL, and uploaded-image backgrounds
- 8 layout presets
- Drag-and-drop layout edit mode
- Saved layouts and layout lock
- Homepage clock, favorites, recent pages, and desktop preview controls
- Shortcut folders, icons, editing, and ordering
- Search-engine selection
- Customization profiles
- Full settings export/import
- Versioned localStorage state with migration from the older `blobby.v3` project
- Mobile responsive settings and browser chrome
- Keyboard shortcuts: `/` search, Ctrl/Cmd+L address bar, Ctrl/Cmd+T new tab, Ctrl/Cmd+W close tab
- Reduced-motion support

## Files

- `index.html` — application structure
- `style.css` — responsive UI, themes, RGB styling, settings, layouts
- `core.js` — state, URL handling, tabs, migration, persistence helpers
- `themes.js` — theme presets and CSS-variable application
- `browser-bridge.js` — MIT App Inventor WebViewString bridge
- `effects.js` — canvas and CSS ambient effects engine
- `layout.js` — layout presets and drag/drop ordering
- `app.js` — browser UI, settings, profiles, shortcuts, navigation
- `APP_INVENTOR_SETUP.md` — exact App Inventor integration instructions
- `tests/check.cjs` — functional/static checks

## GitHub Pages

Keep `index.html` at repository root. In GitHub:

1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main`
4. Folder: `/ (root)`

Then use the generated GitHub Pages URL for `WebViewer_UI.HomeUrl` in App Inventor.

## App Inventor

See **APP_INVENTOR_SETUP.md**.

The core idea is:

```text
WebViewer_UI
  GitHub-hosted blobby.vip controls
        ↓ WebViewString commands
App Inventor blocks
        ↓
WebViewer_Browser
  actual external website
```

## App Inventor commands

blobby.vip can send:

```text
NAVIGATE|https://example.com/
BACK|https://previous.example/
FORWARD|https://next.example/
REFRESH
HOME
SHOW_HOME|tabId
NEW_TAB|tabId
CLOSE_TAB|tabId
SWITCH_TAB|tabId
CLOSE_OTHER_TABS|tabId
OPEN_EXTERNAL|https://example.com/
EXPAND_UI|settings
RESTORE_UI|browser
```

App Inventor can send back to the UI by setting `WebViewer_UI.WebViewString`:

```text
URL|https://example.com/page
TITLE|Example Page
HOME_SHOWN
CONNECTED
```

## Local storage

The app stores preferences under `blobby.v5`. Background uploads are limited to 2 MB to reduce the risk of exceeding browser localStorage limits.

## Performance note

Running many canvas effects, blur, RGB, animated gradients, and large background images at the same time can be expensive on a phone. Performance Mode keeps the selected settings saved but temporarily disables the heaviest rendering work.
