# SharePoint Live Update Plan

The public catalogue should not expose the Excel workbook or Microsoft credentials. Visitors only see the rendered catalogue. The Vercel backend, or an external automation, privately reads the SharePoint workbook and refreshes public JSON/assets.

## Required Microsoft Setup

1. Microsoft Entra app registration.
2. Tenant ID.
3. Client ID.
4. Client secret or certificate.
5. Admin consent for one of these permission approaches:
   - Preferred: `Sites.Selected`, then grant the app read access only to the required SharePoint site/library.
   - Simpler but broader: `Files.Read.All` or `Sites.Read.All`.
6. SharePoint site ID for `bluewud.sharepoint.com/sites/GraphicUnit`.
7. Drive/library ID and item ID for `CHP Price list.xlsx`.

The shared URL contains the workbook identity, but app-only access should use Graph IDs rather than a browser sharing URL.

## Refresh Options

### Option A: Power Automate Trigger

Most reliable for "instant" updates.

1. Trigger: when `CHP Price list.xlsx` is modified in SharePoint.
2. Action: call a Vercel refresh endpoint with a secret.
3. Vercel downloads workbook data through Microsoft Graph, regenerates catalogue JSON, and stores it.

This avoids waiting for Vercel cron and works well with SharePoint's own change events.

### Option B: Microsoft Graph Change Notifications

Use Graph subscriptions to receive SharePoint/drive change notifications at a Vercel webhook URL. The webhook then validates `clientState`, fetches the workbook, recalculates/reads ranges, and refreshes catalogue data.

Subscriptions expire and must be renewed on a schedule.

### Option C: Vercel Cron Polling

Simpler fallback.

1. Vercel cron runs every few minutes.
2. It checks workbook `lastModifiedDateTime`.
3. If changed, it refreshes catalogue JSON.

This is not instant, but it is operationally simple.

## Data Strategy

The current offline build reconstructs dynamic Excel image formulas from workbook data:

- Product image: master sheet `Main Image Link`.
- QR code: `https://quickchart.io/qr?text=` + encoded product URL.
- Catalogue values: visible `Price List Structured` sheet.

For SharePoint live mode, keep this same extraction model. It is more reliable than depending on Excel's `IMAGE()` formula rendering in PDF export, because some Excel runtimes return `#NAME?` for those formula images.

## Persistence On Vercel

Vercel serverless functions cannot permanently write back into the deployed filesystem. A live refresh endpoint needs one of these:

- Vercel Blob for `catalogue.json` and generated assets.
- Supabase Storage or another object store.
- Dynamic Graph fetch on every request with short CDN caching.
- Manual redeploy after generating `data/catalogue.json` locally.

For the first live version, I recommend Vercel Blob or dynamic Graph fetch with `s-maxage` caching.

## Environment Variables

Use names like:

```text
MS_TENANT_ID=
MS_CLIENT_ID=
MS_CLIENT_SECRET=
MS_SITE_ID=
MS_DRIVE_ID=
MS_ITEM_ID=
CATALOGUE_REFRESH_SECRET=
```

Do not expose these in browser code.

## PDF Export Path

The browser `Download PDF` button uses print CSS and produces a clean A4 catalogue without the website controls. If you later need an official Excel-rendered PDF, use Microsoft Graph conversion or Power Automate to export the workbook as PDF, then store and serve that PDF beside the web catalogue.
