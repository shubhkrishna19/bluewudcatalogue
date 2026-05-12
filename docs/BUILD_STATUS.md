# CHP Catalogue Build Status

## Done

- Standalone static Vercel-ready project created.
- Offline workbook extraction working from `CHP Price list.xlsx`.
- Front page and last page extracted from Excel image sheets.
- 221 catalogue products extracted from `Price List Structured`.
- Product images and QR URLs generated from workbook cached master data.
- Flipbook view, PDF view, search, category selection, and print/download flow added.
- SharePoint live-update architecture documented in `docs/SHAREPOINT_LIVE_UPDATE.md`.

## In Progress

- Public-facing immersive catalogue UI polish.
- Fullscreen browsing for flipbook and PDF views.
- GitHub push to `https://github.com/shubhkrishna19/bluewudcatalogue.git`.

## Deferred Until After First Live Vercel Deployment

- Exact QR/product-link correction against the live Bluewud product catalogue.
- SharePoint live refresh implementation with Microsoft Graph credentials and persistent storage.
- Optional official Excel-rendered PDF export pipeline.

## Important Note

The current QR flow uses workbook-sourced Bluewud links with a basic safety fallback. The final exact matching pass should map each catalogue row to the real `bluewud.com` product by SKU/name after the first public build is live.
