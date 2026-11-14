# EX OPS — new UI

Preview: https://yasojima.github.io/exops-ui/

Page 2: https://yasojima.github.io/exops-ui/#orders/incoming

Previous working application: https://yasojima.github.io/exops/?demo=maple#orders

This repository contains only the new orange interface. The first page and the four status tabs on page 2 use the adopted 1280 × 624 layout, SVG artwork and matte press material. The former login, management screens, dialogs, demo server, database and business logic are removed from this branch.

Time cards open page 2; its close button returns to the entrance. State tabs, sample-card filtering, date stepping and press feedback work locally. Counts and cards are visual samples. QR, the date popup, refresh and business actions have no connection yet. Pagination stays at 1 / 1 while its press can be inspected. Menu aggregation is awaiting its own new layout.

The previous application is maintained separately. Common requirements remain reference material; connections will be decided after the new UI is developed. No storage migration or data deletion is performed.

Editable files: `ui.mjs`, `entry-template.mjs`, `orders-template.mjs`, `fonts.css`, `index.html`. Serve this folder with a static web server. GitHub Pages uses main / root. Prior revisions remain available in Git history.
