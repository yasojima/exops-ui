# EX OPS — new UI

Preview: https://yasojima.github.io/exops-ui/

Page 2: https://yasojima.github.io/exops-ui/#orders/incoming

Previous working application: https://yasojima.github.io/exops/?demo=maple#orders

This repository contains only the new orange interface. The first page and the four status tabs on page 2 use the adopted 1280 × 624 layout, SVG artwork and matte press material. The former login, management screens, dialogs, demo server, database and business logic are removed from this branch.

Time cards open page 2; its close button returns to the entrance. State tabs, sample-card filtering, date stepping and press feedback work locally. Counts and cards are local samples. Page 2 has four state tabs, seven pickup-time filters, 12 cards per page, order-number search and a local refresh timestamp. Each state has 36 sample orders: 20 at 11:00, then 4/6/3/2/1 at 10-minute intervals. Filtering and pagination preserve the other time-slot counts. QR, the date popup and business actions have no server connection yet. Refresh recomputes the local view; it does not claim to synchronize live orders. Menu aggregation is awaiting its own new layout.

The previous application is maintained separately. Common requirements remain reference material; connections will be decided after the new UI is developed. No storage migration or data deletion is performed.

Editable files: `ui.mjs`, `entry-template.mjs`, `orders-template.mjs`, `fonts.css`, `index.html`. Serve this folder with a static web server. GitHub Pages uses main / root. Prior revisions remain available in Git history.
