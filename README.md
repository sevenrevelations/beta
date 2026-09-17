# blobby.vip

A dependency-free homepage for a browser or MIT App Inventor CustomWebView.

## Publish on GitHub Pages

1. Extract the download. Upload `index.html`, `style.css`, `core.js`, and `app.js` together to the root of your GitHub repository. Keep filenames unchanged.
2. Open repository **Settings → Pages**.
3. Select **Deploy from a branch**, then **main** and **/ (root)**. Save.
4. Use the URL GitHub displays once deployment finishes. It will normally look like `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

No build, npm install, API key, or server is required. The README and tests are optional uploads. This package contains source files, not an App Inventor project.

[GitHub's publishing instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Connect to your App Inventor project

Replace the old homepage URL in the project's startup, Home, and new-tab blocks with your GitHub Pages URL. Also replace comparisons against the old homepage URL, which your project uses to label new tabs and clear the address bar. Keep the final slash consistent.

The homepage uses direct same-tab navigation, never an iframe. Your native App Inventor toolbar stays outside the webpage. Make sure link navigation and JavaScript are enabled in your WebView. The settings customize only the homepage, not other websites or the native toolbar. This does not bypass school/network restrictions or websites that prohibit embedded-app login.

Use the GitHub Pages URL, not a github.com repository link or a raw source link. The blobby.vip brand does not register or connect the actual blobby.vip domain.

## Included features

- Six previewable themes: Midnight, Arctic, Aurora, Sunset, Ocean, Monochrome.
- Hue slider, color picker, hex input, contrast-adjusted accent text and button labels.
- Light, dark and device-matching modes; larger text.
- Named custom themes with load, rename and delete.
- Optional gradient, animated gradient, hover movement, shadows, glow, glass, entrance animation and snow.
- Master effects switch; reduced-motion support; snow density and speed.
- Centered, Compact, Dashboard and Minimal layouts with previews.
- Content width, spacing, tile height, desktop columns and section visibility controls.
- Named custom layouts, including shortcut order, with load, rename and delete.
- Shortcut editing and desktop drag reorder, plus touch/keyboard move buttons.
- Google, DuckDuckGo and Bing; recent entries and search suggestions.
- Separate appearance, layout and all-settings resets with confirmation.
- Old blobby settings/shortcuts/recent data migrate on the same website origin.

## Performance behavior

Performance mode cancels requestAnimationFrame for snow, clears the particle array, releases the canvas bitmap, removes gradients, shadows, glow and backdrop blur, and disables CSS movement. It also skips shortcut icons, the recent list and suggestions. Your preferences are not overwritten.

Snow is off by default, capped at 100 particles and uses one canvas at CSS-pixel resolution. It stops on page hide, reduced motion, performance mode or master-effects off. There are no polling timers, remote fonts, image downloads, analytics or effect libraries.

No speedup percentage is claimed. This reduces homepage rendering work; it cannot improve external websites or change native WebView settings.

## Saved data

Preferences, up to 12 shortcuts, 20 recent entries, 20 custom themes and 20 custom layouts save in localStorage under `blobby.v3`. Turning recording off stops future entries; use Clear to erase existing entries. Nothing is uploaded to a backend.

Settings belong to the current browser and website origin. Moving from the ChatGPT-hosted URL to GitHub Pages starts fresh local settings. If storage is blocked, navigation and customization continue for the current page session.

## Validation

Run `node tests/check.cjs` if Node.js is installed. No dependencies are needed.

Checks cover search encoding, unsafe URL rejection, contrast across all presets, migration, custom theme/layout persistence, shortcuts and reorder, blocked storage, snow cleanup, reduced motion and performance overrides.

The automated interaction checks use a lightweight DOM harness. They are not a rendered-browser test, and this release has not been tested on a physical Chromebook or inside AI Companion. Check the layout and interactions on your target device after deployment; no on-device timing benchmark has been performed.

In the original Sites checkout, web files are in `dist/`. In the GitHub download they are at the archive root. The test script supports both structures.


## Browser shell
This build includes a lightweight tabbed browser UI with back, forward, refresh, home, search/address navigation, up to 8 tabs, and an external-open fallback. Some websites block iframe embedding via their security headers; use the ↗ button for those sites. For a true unrestricted browser inside MIT App Inventor, connect equivalent controls to a native WebViewer.
