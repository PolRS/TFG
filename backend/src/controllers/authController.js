import jwt from "jsonwebtoken";
import { getGoogleTokens, parseIdToken } from "../services/googleAuthService.js";
import { findOrCreateUser } from "../models/userModel.js";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/auth/google/callback";
const JWT_SECRET = process.env.JWT_SECRET;

export const redirectToGoogle = (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=openid email profile`;
  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  const code = req.query.code;
  const tokens = await getGoogleTokens(code, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  const userInfo = parseIdToken(tokens.id_token);

  const user = await findOrCreateUser(userInfo.googleId, userInfo.email, userInfo.name);

  const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

  res.redirect(`http://localhost:5173/?token=${jwtToken}`);
};
