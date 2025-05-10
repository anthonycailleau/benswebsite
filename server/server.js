import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
console.log("📌 EMAIL_USER:", process.env.EMAIL_USER);
console.log(

"📌 EMAIL_PASS:",
process.env.EMAIL_PASS ? "********" : "Non défini"
);
console.log("📌 EMAIL_RECEIVER:", process.env.EMAIL_RECEIVER);
const app = express();
app.use(express.json());

// 🔧 Correction des en-têtes CORS

app.use(
cors({
origin: "http://localhost:3000",
methods: "POST",
allowedHeaders: ["Content-Type", "Authorization"],

})
);

const transporter = nodemailer.createTransport({
host: "smtp.gmail.com",
port: 587,
secure: false,
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS,
},
});

  

app.post("/send-mail", async (req, res) => {
    const { firstName, lastName, email, message } = req.body;
    console.log("📨 Données reçues :", req.body); // <-- Vérifie que les données arrivent

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECEIVER,
            subject: "Nouveau message du formulaire de contact",
            text: `
Nom: ${firstName} ${lastName}
Email: ${email}
Message: ${message}`,
        });

        res.status(200).json({ message: "E-mail envoyé avec succès !" });
    } catch (error) {
        console.error("❌ Erreur Nodemailer :", error); // 🔥 Ce log est essentiel
        res.status(500).json({ error: "Erreur lors de l'envoi du mail" });
    }
});

// 🔧 Correction du port dans le message console

const PORT = 5001;

app.listen(PORT, () => console.log(`Serveur en écoute sur le port ${PORT}`));