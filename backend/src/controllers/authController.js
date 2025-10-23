import { getGoogleAuthURL, getTokensFromCode, getGoogleUser } from "../services/googleAuthService.js";
import { findOrCreateUser } from "../models/user.js";
import { generateTokens } from "../utils/tokenUtils.js";

export async function redirectToGoogle(req, res) {
  const url = getGoogleAuthURL();
  res.redirect(url);
}



export async function handleGoogleCallback(req, res) {
  try {
    const code = req.query.code;
    const tokens = await getTokensFromCode(code);
    const googleUser = await getGoogleUser(tokens.access_token);

    const user = await findOrCreateUser(googleUser);
    const appTokens = generateTokens(user);

    const redirectUrl = `${process.env.FRONTEND_URL}/?token=${appTokens.access}&user=${encodeURIComponent(JSON.stringify(user))}`;
    res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Error autenticant usuari" });
  }
}
