import axios from "axios";

export async function getGoogleTokens(code, clientId, clientSecret, redirectUri) {
  const response = await axios.post(
    "https://oauth2.googleapis.com/token",
    null,
    {
      params: {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      },
    }
  );
  return response.data; // Conté id_token i access_token
}

export function parseIdToken(idToken) {
  const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString());
  return { googleId: payload.sub, email: payload.email, name: payload.name };
}