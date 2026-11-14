# EX OPS UI

New tablet UI development: https://yasojima.github.io/exops-ui/

Previous application for comparison: https://yasojima.github.io/exops/

The first screen uses a 1280 × 624 reference workspace and scales uniformly.
Tabs, date selection, order search, QR dialog, refresh and time cards are interactive.
This public preview uses fictional orders stored in the browser, independently of the previous application.
External merchant, payment and production server connections are not configured here.

The root contains the browser distribution. `index.html` verifies the SHA-256 of the runtime module bundle before loading it. Publish from `main` / root with GitHub Pages.
