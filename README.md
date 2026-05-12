# Bluewud CHP Catalogue

Standalone static catalogue built from `CHP Price list.xlsx`.

## What Is Included

- PDF-style flipbook catalogue for browsing.
- Product/category search inside the catalogue UI.
- PDF view and browser print/download flow.
- Front and last pages extracted directly from the workbook.
- Product names, SKUs, dimensions, weights, MRP, CHP, product images, and QR URLs extracted from the workbook and its cached linked master data.

## Local Run

```powershell
cd C:\Users\shubh\Downloads\chp-catalogue
python -m http.server 4173
```

Open `http://localhost:4173`.

## Refresh From Offline Workbook

```powershell
cd C:\Users\shubh\Downloads\chp-catalogue
& 'C:\Users\shubh\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' .\scripts\extract_catalogue.py --workbook 'C:\Users\shubh\Downloads\CHP Price list.xlsx'
```

This updates `data/catalogue.json` and `assets/generated/*`.

## Vercel

This first build has no npm dependency requirement. Push the folder to a Git repo and import it in Vercel as a static project. The public entry file is `index.html`.

For live SharePoint updates, see `docs/SHAREPOINT_LIVE_UPDATE.md`.
