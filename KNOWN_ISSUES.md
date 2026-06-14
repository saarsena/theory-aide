# Known Issues

## Counterpoint Checker — opens in dark theme even when light is active

**File:** `src/counterpoint.html`  
**Symptom:** The modal opens in dark mode even when the other modals have been switched to light mode and `ta-theme = "light"` is stored in localStorage.  
**Likely cause:** The theme IIFE is in the body `<script>` block (same as other modals), but something in the webview's loading order for this modal may be causing a FOUC or a missed localStorage read before first paint.  
**Fix to try:** Move the theme initialization into an inline `<script>` tag in `<head>` so it runs as a blocking script before any CSS paints — the same approach that would prevent flash-of-unstyled-content in a browser.
