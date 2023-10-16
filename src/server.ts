const { ApolloServer } = require("apollo-server");
const { resolvers, typeDefs } = require("./schemas/schema");
import { getUser } from "./authUtils";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }: any) => {
    const token = req.headers.authorization || "";

    //when checking for queries that dont need auth such as query all movies..
    //..we return empty so context can work even without token
    if (token === "") return {};

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
