const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const { resolvers, typeDefs } = require("./schemas/schema");
const { getUser } = require("./auth"); // Updated import
const cors = require("cors");
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();

// // Authentication middleware
// app.use(({ req, next }: any) => {
//   const token = req.headers.authorization || "";
//   const user = getUser(token);

//   if (user) {
//     req.user = user;
//   }

//   next();
// });

app.use(({ req, res, next }: any) => {
  const token = req.headers.authorization;

  if (token) {
    const user = getUser(token);
    if (user) {
      req.user = user;
    }
  }

  next();
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }: any) => ({
    prisma,
    user: req.user,
  }),
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
}

startServer();
