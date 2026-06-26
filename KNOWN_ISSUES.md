# Known Issues

_None currently open._

## Resolved

### Counterpoint Checker — opened in dark theme even when light was active

**File:** `src/counterpoint.html`
**Symptom:** The modal opened in dark mode even when other modals had been switched to light and `ta-theme = "light"` was stored in localStorage.
**Cause:** The theme was applied by a `<script>` at the bottom of the body, so the page painted with the default (dark) CSS before the saved theme was read — a flash-of-unstyled-content.
**Fix:** Added a small blocking `<script>` in `<head>` that reads `ta-theme` and sets `data-theme` before any CSS paints. The same guard was added to the new track-picker modal (`src/cptracks.html`).
