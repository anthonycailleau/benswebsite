import AWS from "aws-sdk";
import { handleCors } from "../utils/cors.js";

// Configuration AWS R2
AWS.config.update({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: "auto",
});

const s3 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
  s3ForcePathStyle: true,
});

export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) return;

  const { lecteur } = req.method === "GET" ? req.query : req.body || req.query;
  if (!lecteur) return res.status(400).json({ error: "lecteur required" });

  const key = `${lecteur}/tracks.json`;

  try {
    // GET - Récupérer les pistes
    if (req.method === "GET") {
      try {
        const getResult = await s3.getObject({
          Bucket: process.env.R2_BUCKET,
          Key: key,
        }).promise();

        // Convertir Body en string puis JSON
        const bodyStr = Buffer.from(getResult.Body).toString("utf-8");
        const tracks = JSON.parse(bodyStr || "[]");

        return res.json({ tracks });
      } catch (err) {
        if (err.code === "NoSuchKey" || err.code === "NotFound") {
          return res.json({ tracks: [] });
        }
        throw err;
      }
    }

    // PUT - Mettre à jour les pistes
    if (req.method === "PUT") {
      const { tracks, replace } = req.body;
      if (!Array.isArray(tracks)) return res.status(400).json({ error: "tracks[] required" });

      let finalTracks = [];

      if (replace) {
        finalTracks = tracks;
      } else {
        // Lire existant
        let existing = [];
        try {
          const getResult = await s3.getObject({
            Bucket: process.env.R2_BUCKET,
            Key: key,
          }).promise();
          const bodyStr = Buffer.from(getResult.Body).toString("utf-8");
          existing = JSON.parse(bodyStr || "[]");
        } catch (err) {
          existing = [];
        }

        // Fusion + suppression doublons audio
        const map = new Map();
        existing.forEach(item => item?.audio && map.set(item.audio, item));
        tracks.forEach(item => item?.audio && map.set(item.audio, item));
        finalTracks = Array.from(map.values());
      }

      // Sauvegarde
      await s3.putObject({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: JSON.stringify(finalTracks, null, 2),
        ContentType: "application/json",
      }).promise();

      return res.json({ ok: true, savedCount: finalTracks.length });
    }

    // DELETE - Supprimer tracks.json
    if (req.method === "DELETE") {
      try {
        await s3.deleteObject({ Bucket: process.env.R2_BUCKET, Key: key }).promise();
        return res.json({ success: true, message: `tracks.json deleted for ${lecteur}` });
      } catch (err) {
        if (err.code === "NoSuchKey" || err.code === "NotFound") {
          return res.json({ success: true, message: `tracks.json not found for ${lecteur}` });
        }
        throw err;
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(`${req.method} /api/tracks error:`, err);
    return res.status(500).json({ error: err.message });
  }
}