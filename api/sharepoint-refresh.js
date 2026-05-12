module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const providedSecret = request.headers["x-catalogue-refresh-secret"];
  if (!process.env.CATALOGUE_REFRESH_SECRET || providedSecret !== process.env.CATALOGUE_REFRESH_SECRET) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  const required = [
    "MS_TENANT_ID",
    "MS_CLIENT_ID",
    "MS_CLIENT_SECRET",
    "MS_SITE_ID",
    "MS_DRIVE_ID",
    "MS_ITEM_ID",
  ];

  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    return response.status(501).json({
      status: "not_configured",
      missing,
      nextStep: "Configure Microsoft Graph app credentials and storage before enabling live refresh.",
    });
  }

  return response.status(501).json({
    status: "planned",
    nextStep: "Graph workbook fetch and persistent storage will be wired after Microsoft app credentials are available.",
  });
}
