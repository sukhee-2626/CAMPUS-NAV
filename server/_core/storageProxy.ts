import type { Express } from "express";
import fs from "fs";
import path from "path";
import { ENV } from "./env";

const LOCAL_ASSET_MAP: Record<string, string> = {
  "campus-map": "illustrated-campus-map.jpeg",
  "full-campus-road-context": "full-campus-road-context.png",
  "campus-navigator-mark": "campus-navigator-mark.png",
  "campus-navigator-aerial": "campus-navigator-aerial.jpg",
  "campus-navigator-walk": "campus-navigator-walk.jpg",
  "campus-navigator-paper": "campus-navigator-paper.jpg",
  "full-campus-map-context": "full-campus-map-context.png",
  "google-maps-route-context": "google-maps-route-context.png",
  "road-context-pins": "road-context-pins.png",
  "road-context-survey": "road-context-survey.png",
};

function resolveLocalAsset(key: string): string | null {
  const rootDir = path.resolve(import.meta.dirname, "../..");
  const publicPath = path.join(rootDir, "client", "public", "manus-storage", key);
  if (fs.existsSync(publicPath)) return publicPath;

  const assetsDir = path.join(rootDir, "campus-assets");
  const directAssetPath = path.join(assetsDir, key);
  if (fs.existsSync(directAssetPath)) return directAssetPath;

  for (const [prefix, filename] of Object.entries(LOCAL_ASSET_MAP)) {
    if (key.startsWith(prefix) || key.includes(prefix)) {
      const mappedPath = path.join(assetsDir, filename);
      if (fs.existsSync(mappedPath)) return mappedPath;
    }
  }

  return null;
}

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    const localFile = resolveLocalAsset(key);
    if (localFile) {
      res.sendFile(localFile);
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(404).send("Asset not found locally and storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
