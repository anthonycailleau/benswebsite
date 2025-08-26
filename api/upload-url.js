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

// Helper: cleanup filename
const cleanFilename = (name) => name.replace(/[^\w\s.-]/g, "").trim();

export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) {
    return; // Requête OPTIONS traitée
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { lecteur, filename, type, contentType } = req.query;
    if (!lecteur || !filename) {
      return res.status(400).json({ error: "lecteur and filename required" });
    }

    // Nettoyage du nom de fichier
    const safe = cleanFilename(filename);
    const Key = `${lecteur}/${Date.now()}-${safe}`;

    // Détermination du Content-Type
    let resolvedContentType = "audio/mpeg"; // par défaut audio

    if (contentType) {
      resolvedContentType = contentType;
    } else if (type === "image") {
      resolvedContentType = "image/jpeg";
    } else if (type === "audio") {
      resolvedContentType = "audio/mpeg";
    }

    const params = {
      Bucket: process.env.R2_BUCKET,
      Key,
      ContentType: resolvedContentType,
      Expires: 300, // 5 minutes
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

    // Construction de l'URL publique du fichier
    const publicBase =
      process.env.R2_PUBLIC_URL ||
      `https://${process.env.R2_ACCOUNT_ID}.r2.dev`;
    const fileUrl = `${publicBase}/${Key}`;

    return res.json({ uploadUrl, fileUrl, key: Key });
  } catch (err) {
    console.error("GET /api/upload-url error:", err);
    return res.status(500).json({ error: err.message });
  }
}