import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("../data/catalogue.json", import.meta.url), "utf8"));

if (!data?.products?.length) {
  throw new Error("Catalogue data has no products.");
}

if (!data?.meta?.coverImage || !data?.meta?.backImage) {
  throw new Error("Catalogue front/back page assets are missing from metadata.");
}

console.log(`Catalogue build validation passed: ${data.products.length} products.`);
