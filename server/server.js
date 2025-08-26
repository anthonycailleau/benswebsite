// server.js
import AWS from "aws-sdk";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json({ limit: "20mb" }));

// === Utilisateur "admin" avec mot de passe hashé ===
// Exemple de hash pour 'Benbridgenstudio44'
const USERS = [
  {
    email: "benbridgenpro@gmail.com",
    passwordHash:
      "$2b$10$j3ORjgV68nO5MUYmuSclBuw69c2.0zT8KjN4jashit5koV3VbeQx2",
  },
];


app.post("/send-mail", async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${firstName} ${lastName}" <${email}>`,
      to: process.env.EMAIL_RECEIVER,
      subject: `Nouveau message de ${firstName} ${lastName}`,
      text: message,
      html: `<p><strong>Nom:</strong> ${firstName} ${lastName}</p>
         <p><strong>Email:</strong> ${email}</p>
         <p><strong>Message:</strong><br/>${message}</p>`,
    };

    await transporter.sendMail(mailOptions);

    console.log(`📩 Message reçu de ${email}`);
    res.json({ success: true, message: "Message envoyé avec succès !" });
  } catch (err) {
    console.error("Erreur send-mail:", err);
    res.status(500).json({ error: "Impossible d'envoyer le message" });
  }
});
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = USERS.find((u) => u.email === email);
  if (!user) return res.json({ success: false });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (match) {
    return res.json({ success: true });
  } else {
    return res.json({ success: false });
  }
});

// AWS R2 (S3-compatible)
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

// GET signed upload URL
// Expects query params:
// lecteur=lecteur1
// filename=file.mp3
// type=audio OR type=image (optional, default audio)
// contentType=optional override MIME type
app.get("/api/upload-url", async (req, res) => {
  try {
    const { lecteur, filename, type, contentType } = req.query;
    if (!lecteur || !filename) {
      return res.status(400).json({ error: "lecteur and filename required" });
    }

    // Nettoyage du nom de fichier
    const safe = cleanFilename(filename);
    const Key = `${lecteur}/${Date.now()}-${safe}`;

    // Détermination du Content-Type en fonction du paramètre "type"
    // Priorité : contentType passé explicitement > type param > default audio/mpeg
    let resolvedContentType = "audio/mpeg"; // par défaut audio

    if (contentType) {
      resolvedContentType = contentType;
    } else if (type === "image") {
      // On peut étendre la détection si besoin selon extension
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
});

// DELETE /api/delete-file
// body: { fileUrl: "https://xxx.r2.dev/lecteur1/xxx.mp3", lecteur: "lecteur1" }
app.delete("/api/delete-file", async (req, res) => {
  try {
    const { fileUrl, lecteur } = req.body;

    if (!fileUrl || !lecteur) {
      return res.status(400).json({ error: "fileUrl and lecteur required" });
    }

    // Extraire la clé du fichier depuis l'URL
    // Format attendu: https://xxx.r2.dev/lecteur1/1234567890-filename.mp3
    const publicBase =
      process.env.R2_PUBLIC_URL ||
      `https://${process.env.R2_ACCOUNT_ID}.r2.dev`;

    let key;
    if (fileUrl.startsWith(publicBase)) {
      // Retirer le domaine de base pour obtenir la clé
      key = fileUrl.substring(publicBase.length + 1); // +1 pour le slash
    } else {
      // Si l'URL ne correspond pas au format attendu, essayer de l'extraire différemment
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

    // Vérifier que la clé appartient bien au lecteur spécifié (sécurité)
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
});

// PUT /api/tracks
// body: { lecteur: "lecteur1", tracks: [ { title, audio, image, artist, type, uploadedAt } ], replace?: boolean }
app.put("/api/tracks", async (req, res) => {
  try {
    const { lecteur, tracks, replace } = req.body;
    console.log(
      "PUT /api/tracks - replace:",
      replace,
      "tracks count:",
      tracks?.length
    ); // DEBUG

    if (!lecteur || !Array.isArray(tracks)) {
      return res.status(400).json({ error: "lecteur and tracks[] required" });
    }

    const key = `${lecteur}/tracks.json`;

    let finalTracks;

    if (replace) {
      // Mode remplacement complet : on utilise directement les tracks fournis
      console.log("Mode REPLACE activé - remplacement complet"); // DEBUG
      finalTracks = tracks;
    } else {
      // Mode fusion (comportement original)
      console.log("Mode FUSION - ajout/mise à jour"); // DEBUG
      let existing = [];
      try {
        const getResult = await s3
          .getObject({ Bucket: process.env.R2_BUCKET, Key: key })
          .promise();
        existing = JSON.parse(getResult.Body.toString("utf-8")) || [];
      } catch (err) {
        if (err.code !== "NoSuchKey" && err.code !== "NotFound") {
          console.warn(
            "Warning reading existing tracks.json:",
            err.code || err.message
          );
        }
        existing = [];
      }

      // Fusion et suppression des doublons (par url audio)
      const map = new Map();
      existing.forEach((item) => {
        if (item && item.audio) map.set(item.audio, item);
      });
      tracks.forEach((item) => {
        if (item && item.audio) map.set(item.audio, item);
      });
      finalTracks = Array.from(map.values());
    }

    console.log("Saving tracks:", finalTracks); // DEBUG

    // Enregistrement des données
    await s3
      .putObject({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: JSON.stringify(finalTracks, null, 2),
        ContentType: "application/json",
      })
      .promise();

    return res.json({ ok: true, savedCount: finalTracks.length, key });
  } catch (err) {
    console.error("PUT /api/tracks error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/tracks?lecteur=lecteur1
app.get("/api/tracks", async (req, res) => {
  try {
    const { lecteur } = req.query;
    if (!lecteur) return res.status(400).json({ error: "lecteur required" });

    const key = `${lecteur}/tracks.json`;
    try {
      const getResult = await s3
        .getObject({ Bucket: process.env.R2_BUCKET, Key: key })
        .promise();
      const tracks = JSON.parse(getResult.Body.toString("utf-8"));
      return res.json({ tracks });
    } catch (err) {
      if (err.code === "NoSuchKey" || err.code === "NotFound") {
        return res.json({ tracks: [] });
      }
      console.error("GET /api/tracks read error:", err);
      return res.status(500).json({ error: err.message });
    }
  } catch (err) {
    console.error("GET /api/tracks error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 🔥 NEW: DELETE /api/tracks?lecteur=lecteur1
// Supprime complètement le fichier tracks.json d’un lecteur
app.delete("/api/tracks", async (req, res) => {
  try {
    const { lecteur } = req.query;
    if (!lecteur) return res.status(400).json({ error: "lecteur required" });

    const key = `${lecteur}/tracks.json`;

    try {
      await s3
        .deleteObject({
          Bucket: process.env.R2_BUCKET,
          Key: key,
        })
        .promise();
      console.log(`Deleted tracks.json for ${lecteur}`);
      return res.json({
        success: true,
        message: `tracks.json deleted for ${lecteur}`,
      });
    } catch (err) {
      if (err.code === "NoSuchKey" || err.code === "NotFound") {
        // Déjà supprimé / inexistant
        return res.json({
          success: true,
          message: `tracks.json not found for ${lecteur}`,
        });
      }
      throw err;
    }
  } catch (err) {
    console.error("DELETE /api/tracks error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
