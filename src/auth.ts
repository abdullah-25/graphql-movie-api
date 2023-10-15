const { verify } = require("jsonwebtoken");
export const JWT_SECRET = "your-secret-key";
export const jwt = require("jsonwebtoken");

function authenticateUser({ req, res, next }: any) {
  const token = req.headers.authorization || "";

  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
}
