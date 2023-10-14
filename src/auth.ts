import { PrismaClient, User } from "@prisma/client";
const { prisma } = require("../db");
import { FastifyRequest } from "fastify";
import { JwtPayload, verify } from "jsonwebtoken";

export const APP_SECRET = "this is my secret";

export async function authenticateUser(
  prisma: PrismaClient,
  request: FastifyRequest
): Promise<User | null> {
  if (request?.headers?.authorization) {
    // 1
    const token = request.headers.authorization.split(" ")[1];
    // 2
    const tokenPayload = verify(token, APP_SECRET) as JwtPayload;
    // 3
    const userId = tokenPayload.userId;

    // return current user or null if not found
    return await prisma.User.findUnique({ where: { id: userId } });
  }

  return null;
}
