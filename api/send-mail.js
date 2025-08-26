import nodemailer from "nodemailer";
import { handleCors } from "../utils/cors.js";

export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) {
    return; // Requête OPTIONS traitée
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  try {
    const transporter = nodemailer.createTransporter({
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
}