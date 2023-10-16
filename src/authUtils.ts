import jwt from "jsonwebtoken";
require("dotenv").config();

export const secret: string = process.env.SECRET as string;

export function requireAuthentication(context: { user: any }) {
  if (!context.user) {
    throw new Error(
      "Unauthorized. You must be logged in to perform this action."
    );
  }
}

export const getUser = (token: string) => {
  try {
    const payload = jwt.verify(token, secret);
    return payload;
  } catch (error) {
    throw new Error("Token verification failed");
  }
};
