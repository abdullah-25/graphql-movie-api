const { ApolloServer } = require("apollo-server");
const { resolvers, typeDefs } = require("./schemas/schema");
import { getUser } from "./authUtils";

//export server so it can be used under __test__ files
export const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }: any) => {
    // Check if there is an authorization header
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader) {
      // Extract the token from the header
      const token = authorizationHeader.split(" ")[1] || "";

      // Check if the token is not empty
      if (token) {
        // Invoke the getUser method from authUtils to verify if the user is authenticated
        const user = await getUser(token);

        // If the user is authenticated, include it in the context
        if (user) {
          return { user };
        }
      }
    }

    // Return an empty context if no valid authorization header is present
    return {};
  },
});

server.listen(3000).then(({ url }: any) => {
  console.log(`🚀 Server listening at: ${url}`);
});
