import AWS from "aws-sdk";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { fileName } = req.body;

  if (!fileName) {
    return res.status(400).json({ error: "Nom de fichier requis" });
  }

  try {
    const s3 = new AWS.S3({
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      signatureVersion: "v4",
      s3ForcePathStyle: true,
    });

    await s3.deleteObject({
      Bucket: process.env.R2_BUCKET,
      Key: fileName,
    }).promise();

    return res.json({ success: true, message: "Fichier supprimé" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Impossible de supprimer le fichier" });
  }
}