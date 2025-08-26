import AWS from "aws-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  try {
    const s3 = new AWS.S3({
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      signatureVersion: "v4",
      s3ForcePathStyle: true,
    });

    const params = {
      Bucket: process.env.R2_BUCKET,
      Key: fileName,
      Expires: 60,
      ContentType: fileType,
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

    return res.json({ uploadUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Impossible de générer l'URL" });
  }
}