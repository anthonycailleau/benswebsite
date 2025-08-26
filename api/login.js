import bcrypt from "bcrypt";
import { handleCors } from "../utils/cors.js";

// Utilisateur admin avec mot de passe hashé
const USERS = [
  {
    email: "benbridgenpro@gmail.com",
    passwordHash: "$2b$10$j3ORjgV68nO5MUYmuSclBuw69c2.0zT8KjN4jashit5koV3VbeQx2",
  },
];

export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) {
    return; // Requête OPTIONS traitée
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false });
  }

  const user = USERS.find((u) => u.email === email);
  if (!user) return res.json({ success: false });

  try {
    const match = await bcrypt.compare(password, user.passwordHash);
    if (match) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.json({ success: false });
  }
}