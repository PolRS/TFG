import jwt from "jsonwebtoken";

const JWT_SECRET_ACCESS = process.env.JWT_SECRET_ACCESS
const JWT_SECRET_REFRESH = process.env.JWT_SECRET_REFRESH

export function generateTokens(user) {
  const access = jwt.sign(
    { userId: user.id },
    JWT_SECRET_ACCESS,
    { expiresIn: "15m" }
  );
  const refresh = jwt.sign(
    { userId: user.id },
    JWT_SECRET_REFRESH,
    { expiresIn: "7d" }
  );
  return { access, refresh };
}
