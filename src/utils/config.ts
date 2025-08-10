// ---------- Config ----------
export const JWT_SECRET = process.env.JWT_SECRET ?? "change_this_in_production";
export const JWT_EXPIRES_IN = "15m"; // short-lived access token
export const REFRESH_EXPIRES_IN = "7d"; // if using refresh tokens
export const BCRYPT_SALT_ROUNDS = 12;