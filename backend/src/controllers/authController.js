import { getTokensFromCode, getGoogleUser } from "../services/googleAuthService.js";
import { findOrCreateUser } from "../models/user.js";
import { generateTokens } from "../utils/tokenUtils.js";
import jwt from "jsonwebtoken"
import querystring from "querystring"
import pool from "../db.js";


const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

export function redirectToGoogle(req, res) {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ].join(" "),
  };

  const googleAuthUrl = `${rootUrl}?${new URLSearchParams(options).toString()}`;
  return res.redirect(googleAuthUrl);
}

export async function handleGoogleCallback(req, res) {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("Codi de Google no rebut");

    const tokens = await getTokensFromCode(code);
    const googleUser = await getGoogleUser(tokens.access_token);
    const user = await findOrCreateUser(googleUser);
    const appTokens = generateTokens(user);

    res.cookie("access_token", appTokens.access, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", appTokens.refresh, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 🔥 Només redirigeix al frontend base (App.vue s’encarrega)
    res.redirect(`${process.env.FRONTEND_URL}/`);
  } catch (err) {
    console.error("❌ Error autenticant amb Google:", err);
    res.status(401).send("Error autenticant usuari amb Google.");
  }
}

/**
 * ✅ Endpoint per verificar sessió (el frontend pot fer /auth/verify)
 */
export function verifyToken(req, res) {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ valid: false, error: "No token" });

  try {
    jwt.verify(token, process.env.JWT_SECRET_ACCESS);
    res.json({ valid: true });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ valid: false, error: "Token expirat" });
    }
    return res.status(401).json({ valid: false, error: "Token invàlid" });
  }
}

/**
 * Retorna les dades de l'usuari autenticat segons el token JWT.
 * El token ve d'una cookie HTTP-only creada durant el login amb Google.
 */
export async function getUser(req, res) {
  try {
    // 🔒 Llegim el token de la cookie
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json({ error: "No autenticat" });

    // ✅ Verifiquem el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS);
    const userId = decoded.userId;

    // 🗄️ Recuperem les dades de l'usuari de la BD
    const { rows } = await pool.query(
      "SELECT id, google_id, nom, email, avatar_url FROM usuaris WHERE id = $1",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuari no trobat" });
    }

    // 🔁 Retornem les dades actualitzades
    res.json({ user: rows[0] });
  } catch (err) {
    console.error("Error obtenint usuari:", err);
    res.status(401).json({ error: "Sessió invàlida o expirada" });
  }
}

export function logout(req, res) {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.json({ success: true });
}