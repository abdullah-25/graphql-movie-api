const { verify } = require("jsonwebtoken");
export const APP_SECRET = "your-secret-key";

export function getUser(token: any) {
  try {
    if (!token) return null;

    // Verify the token and extract the user information
    const payload = verify(token, APP_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}
