// api/upload-url.js
import AWS from "aws-sdk";

// --- CORS Helper ---
const allowedOrigins = [
  "https://benbridgen.com",
  "https://www.benbridgen.com",
  ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000", "http://localhost:3001"] : []),
];

const setCorsHeaders = (res, origin) => {
  const isAllowed =
    allowedOrigins.includes(origin) ||
    (process.env.NODE_ENV === "development" && origin?.includes("localhost"));

  // Si origin autorisé, le mettre, sinon mettre '*' pour éviter le blocage
  res.setHeader("Access-Control-Allow-Origin", isAllowed ? origin : "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24h
};

const handleCors = (req, res) => {
  const origin = req.headers.origin || "https://benbridgen.com";
  setCorsHeaders(res, origin);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true; // preflight traité
  }
  return false; // continuer pour GET/POST
};

// --- AWS R2 Configuration ---
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

// --- Helper filename ---
const cleanFilename = (name) => name.replace(/[^\w\s.-]/g, "").trim();

// --- Main Handler ---
export default async function handler(req, res) {
  if (handleCors(req, res)) return; // OPTIONS traité

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { lecteur, filename, type, contentType } = req.query;
    if (!lecteur || !filename) {
      return res.status(400).json({ error: "lecteur and filename required" });
    }

    const safe = cleanFilename(filename);
    const Key = `${lecteur}/${Date.now()}-${safe}`;

    let resolvedContentType = "audio/mpeg"; // défaut
    if (contentType) resolvedContentType = contentType;
    else if (type === "image") resolvedContentType = "image/jpeg";
    else if (type === "audio") resolvedContentType = "audio/mpeg";

    const params = {
      Bucket: process.env.R2_BUCKET,
      Key,
      ContentType: resolvedContentType,
      Expires: 300, // 5 minutes
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

    const publicBase = process.env.R2_PUBLIC_URL || `https://${process.env.R2_ACCOUNT_ID}.r2.dev`;
    const fileUrl = `${publicBase}/${Key}`;

    return res.json({ uploadUrl, fileUrl, key: Key });
  } catch (err) {
    console.error("GET /api/upload-url error:", err);
    return res.status(500).json({ error: err.message });
  }
}