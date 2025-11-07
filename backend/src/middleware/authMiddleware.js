import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  console.log("token rebut:", token)

  if (!token) {
    return res.status(401).json({ error: "Token d'autenticació requerit" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_ACCESS);
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    console.error("Error verificant token", err);
    res.status(401).json({ error: "Token d'autenticació invàlid" });
  }
}