import AWS from "aws-sdk";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const s3 = new AWS.S3({
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      signatureVersion: "v4",
      s3ForcePathStyle: true,
    });

    const data = await s3.listObjectsV2({
      Bucket: process.env.R2_BUCKET,
    }).promise();

    const tracks = data.Contents.map(item => ({
      key: item.Key,
      lastModified: item.LastModified,
      size: item.Size,
      url: `${process.env.R2_PUBLIC_URL}/${item.Key}`,
    }));

    return res.json({ tracks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Impossible de lister les fichiers" });
  }
}