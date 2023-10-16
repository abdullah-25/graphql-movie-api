const { ApolloServer, gql, GraphQLError } = require("apollo-server");
const { resolvers, typeDefs } = require("./schemas/schema");
import jwt from "jsonwebtoken";
require("dotenv").config();

export const secret: string = process.env.SECRET as string;

const getUser = (token: string) => {
  try {
    const payload = jwt.verify(token, secret);
    return payload;
  } catch (error) {
    throw new Error("Token verification failed");
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }: any) => {
    //split method added to extract only the key and not the word 'bearer'
    const token = req.headers.authorization.split(" ")[1] || "";

    //when checking for queries that dont need auth such as query all movies..
    //..we return empty so context can work even without token
    if (token === "" || token === undefined || token === null) return {};

    if (token) {
      const user = await getUser(token);

      if (user) {
        return { user };
      }
    }
  },
});

server.listen(3000).then(({ url }: any) => {
  console.log(`🚀 Server listening at: ${url}`);
});
