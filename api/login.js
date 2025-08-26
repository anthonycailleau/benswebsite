import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Identifiants manquants" });
  }

  // Identifiants sécurisés dans .env
  const USER = process.env.ADMIN_USER || "admin";
  const HASHED_PASS = process.env.ADMIN_PASS_HASH;

  if (!HASHED_PASS) {
    return res.status(500).json({ error: "Mot de passe non configuré" });
  }

  try {
    if (username !== USER) {
      return res.status(401).json({ error: "Utilisateur incorrect" });
    }

    const isValid = await bcrypt.compare(password, HASHED_PASS);
    if (!isValid) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    return res.status(200).json({ success: true, message: "Connexion réussie" });
  } catch (error) {
    console.error("Erreur login:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}