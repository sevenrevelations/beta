# blobby.vip + MIT App Inventor setup

blobby.vip is now the **browser controller UI**. External websites are **not** loaded in an iframe. A second MIT App Inventor `WebViewer` loads the actual website.

This matches App Inventor's WebViewer communication model: JavaScript in the UI page uses `window.AppInventor.setWebViewString(...)`, and the app receives the value in the UI WebViewer's `WebViewStringChange` event.

## Designer

Create these components on `Screen1`:

1. `VerticalArrangement_Main`
   - Width: Fill parent
   - Height: Fill parent
2. `WebViewer_UI` inside the arrangement
   - HomeUrl: your GitHub Pages blobby.vip URL
   - Width: Fill parent
   - Height: Fill parent initially
3. `WebViewer_Browser` below `WebViewer_UI`
   - Width: Fill parent
   - Height: Fill parent
   - Visible: false initially

Recommended initial state:

- `WebViewer_UI.Visible = true`
- `WebViewer_UI.Height = Fill parent`
- `WebViewer_Browser.Visible = false`

When a real page is opened, shrink `WebViewer_UI` to about **175–190 px** so the top bar, tabs, and address bar remain visible, then show `WebViewer_Browser` for the rest of the screen.

## Messages sent from blobby.vip

The UI sends plain strings through `WebViewer_UI.WebViewStringChange`:

| Message | App Inventor action |
|---|---|
| `NAVIGATE|https://example.com/` | Show `WebViewer_Browser`, shrink `WebViewer_UI`, call `WebViewer_Browser.GoToUrl(url)` |
| `BACK|https://target.example/` | Call `WebViewer_Browser.GoToUrl(target)` so back history stays isolated to the active blobby.vip tab |
| `FORWARD|https://target.example/` | Call `WebViewer_Browser.GoToUrl(target)` so forward history stays isolated to the active blobby.vip tab |
| `REFRESH` | Call `WebViewer_Browser.Reload` |
| `HOME` | Hide `WebViewer_Browser`, expand `WebViewer_UI` to Fill parent |
| `SHOW_HOME|tabId` | Same as HOME |
| `NEW_TAB|tabId` | No WebViewer action required; blobby.vip stores the tab state |
| `SWITCH_TAB|tabId` | No action by itself; a `NAVIGATE` or `SHOW_HOME` message follows |
| `CLOSE_TAB|tabId` | No action by itself |
| `CLOSE_OTHER_TABS|tabId` | No action by itself |
| `OPEN_EXTERNAL|url` | Optional: open in the Android system browser with Activity Starter |
| `EXPAND_UI|settings` or `EXPAND_UI|layout` | Hide the browser WebViewer and expand `WebViewer_UI` to Fill parent so full-screen panels are not clipped |
| `RESTORE_UI|browser` | Shrink `WebViewer_UI` back to toolbar height and show the already-loaded browser WebViewer |
| `RESTORE_UI|home` | Keep `WebViewer_UI` Fill parent and keep the browser WebViewer hidden |

## Main WebViewStringChange block

Create:

`when WebViewer_UI.WebViewStringChange(value)`

Then split `value` at `|`.

Pseudo-block logic:

```text
if value starts with "NAVIGATE|"
    set url to text after "NAVIGATE|"
    set WebViewer_UI.Height to 185 px
    set WebViewer_Browser.Visible to true
    call WebViewer_Browser.GoToUrl(url)

else if value starts with "BACK|"
    set url to text after "BACK|"
    call WebViewer_Browser.GoToUrl(url)

else if value starts with "FORWARD|"
    set url to text after "FORWARD|"
    call WebViewer_Browser.GoToUrl(url)

else if value = "REFRESH"
    call WebViewer_Browser.Reload

else if value = "HOME" or value starts with "SHOW_HOME|"
    set WebViewer_Browser.Visible to false
    set WebViewer_UI.Height to Fill parent

else if value starts with "EXPAND_UI|"
    set WebViewer_Browser.Visible to false
    set WebViewer_UI.Height to Fill parent

else if value = "RESTORE_UI|browser"
    set WebViewer_UI.Height to 185 px
    set WebViewer_Browser.Visible to true

else if value = "RESTORE_UI|home"
    set WebViewer_Browser.Visible to false
    set WebViewer_UI.Height to Fill parent
```

## Keep blobby.vip in sync with the real WebViewer

After the browser WebViewer loads a page, send its actual URL back to the UI.

Create:

`when WebViewer_Browser.PageLoaded(url)`

Then:

```text
set WebViewer_UI.WebViewString to join "URL|" url
```

blobby.vip keeps Back/Forward availability itself for each logical tab, so you do not need to mirror the WebViewer's global history state. This avoids one tab accidentally navigating into another tab's history.

## Optional title sync

If you later retrieve a page title in App Inventor, send:

```text
TITLE|Page title here
```

The blobby.vip tab title will update.

## Important WebViewer limitation

MIT App Inventor's WebViewer is much better for this project than an HTML iframe, but it is still not a full Chrome/Safari replacement. Some sign-in flows, popups, downloads, permissions, or sites that require a full browser may behave differently.

## GitHub Pages

Upload the files at repository root so `index.html` is directly visible on the repo's main page. Enable:

- Settings → Pages
- Deploy from a branch
- `main`
- `/ (root)`

Use the Pages URL as `WebViewer_UI.HomeUrl`.
