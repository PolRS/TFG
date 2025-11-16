import axios from "axios";
import querystring from "querystring";
import crypto from 'crypto';
import { google } from 'googleapis'


const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";



export async function getTokensFromCode(code) {
  const res = await axios.post("https://oauth2.googleapis.com/token", 
    querystring.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code"
    }), 
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  
  return res.data;
}

export async function getGoogleUser(access_token) {
  const res = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  });
  return res.data; // { email, name, picture, ... }
}