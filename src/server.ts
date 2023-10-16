const { ApolloServer, gql, GraphQLError } = require("apollo-server");
const { resolvers, typeDefs } = require("./schemas/schema");
import jwt, { JwtPayload } from "jsonwebtoken";

export const SECRET = "hedwhdjwdjnwjndjnnmkwqamwkd";

const getUser = (token: string) => {
  try {
    const payload = jwt.verify(token, SECRET);
    return payload;
  } catch (error) {
    // Handle token verification error
    console.log(error);
    return null;
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }: any) => {
    const token = req.headers.authorization.split(" ")[1] || "";
    console.log("Received token:", token);

    if (token) {
      const user = await getUser(token);
      console.log("User from token:", user);

      if (user) {
        return { user };
      }
    }

    // You can return an empty context or handle unauthenticated cases as needed.
    return {};
  },
});

// Start the server with the specified port
server.listen(3000).then(({ url }: any) => {
  console.log(`🚀 Server listening at: ${url}`);
});
