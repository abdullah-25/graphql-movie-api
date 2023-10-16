const { ApolloServer, gql, GraphQLError } = require("apollo-server");
const { resolvers, typeDefs } = require("./schemas/schema");
import { getUser } from "./authUtils";

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
      //invoke getUser method from wuthUtils to verify if user is authenticated
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
