// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.cookies.access_token; 
  
  if (!token) {
    console.warn("No s'ha trobat cap cookie d'autenticació");
    return res.status(401).json({ error: "No autenticat" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_ACCESS);
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    console.error("Error verificant token:", err.name);
    return res.status(401).json({
      error:
        err.name === "TokenExpiredError"
          ? "Token expirat"
          : "Token d'autenticació invàlid",
    });
  }
}
