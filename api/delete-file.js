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
  if (handleCors(req, res)) {
    return; // Requête OPTIONS traitée
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileUrl, lecteur } = req.body;

    if (!fileUrl || !lecteur) {
      return res.status(400).json({ error: "fileUrl and lecteur required" });
    }

    // Extraire la clé du fichier depuis l'URL
    const publicBase =
      process.env.R2_PUBLIC_URL ||
      `https://${process.env.R2_ACCOUNT_ID}.r2.dev`;

    let key;
    if (fileUrl.startsWith(publicBase)) {
      key = fileUrl.substring(publicBase.length + 1);
    } else {
      const urlParts = fileUrl.split("/");
      const lecteurIndex = urlParts.findIndex((part) =>
        part.startsWith("lecteur")
      );
      if (lecteurIndex !== -1) {
        key = urlParts.slice(lecteurIndex).join("/");
      } else {
        return res.status(400).json({ error: "Invalid file URL format" });
      }
    }

    // Vérifier que la clé appartient bien au lecteur spécifié
    if (!key.startsWith(`${lecteur}/`)) {
      return res.status(403).json({
        error: "Unauthorized: file does not belong to specified lecteur",
      });
    }

    // Supprimer le fichier de R2
    const deleteParams = {
      Bucket: process.env.R2_BUCKET,
      Key: key,
    };

    await s3.deleteObject(deleteParams).promise();

    console.log(`Deleted file: ${key}`);
    return res.json({
      success: true,
      message: "File deleted successfully",
      key,
    });
  } catch (err) {
    console.error("DELETE /api/delete-file error:", err);
    return res.status(500).json({ error: err.message });
  }
}
