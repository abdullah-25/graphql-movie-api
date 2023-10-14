import { gql } from "apollo-server";
const { prisma } = require("../db");
import { GraphQLScalarType, Kind } from "graphql";

const typeDefs = gql`
  type User {
    id: Int!
    username: String!
    email: String!
  }
  scalar Date

  type Movie {
    id: Int!
    name: String!
    description: String!
    director: String!
    releaseDate: Date!
  }

  type Query {
    getUsers: [User!]!
    getUser(id: Int!): User
    getMovies: [Movie!]!
    getMovie(id: Int!): Movie
    getUserMovies: [UsersMovies!]!
    getUserMoviesByUserID(id: Int!): [UsersMovies!]!
    searchMovies(searchTerm: String): [Movie!]!
    sortMovies(sortBy: String): [Movie!]!
    moviePagination(skip: Int!, take: Int!): [Movie!]!
  }
  type UsersMovies {
    id: Int!
    userId: Int!
    movieId: Int!
  }

  type Error {
    message: String!
    code: String
  }

  type Mutation {
    signup(email: String!, password: String!, name: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    createMovie(data: MovieInput!): Movie!
    updateMovie(id: Int!, data: MovieInput!): Movie!
    deleteMovie(id: Int!): Movie!
  }

  type AuthPayload {
    token: String
    user: User
  }

  type DeleteMovieResponse {
    movie: Movie
    error: Error
  }

  type CreateUserResponse {
    user: User
    error: Error
  }

  input UserInput {
    username: String!
    email: String!
    password: String!
  }

  input MovieInput {
    name: String!
    description: String!
    director: String!
    releaseDate: Date!
  }
`;

// const movies = [
//   {
//     id: 3,
//     name: "Chrostopher Nolan",
//     description:
//       "The plot follows the vigilante Batman, police lieutenant James Gordon, and district attorney Harvey Dent, who form an alliance to dismantle organized crime in Gotham City",
//     director: "Takashi Shimizu",
//     releaseDate: "2008-07-18",
//   },
//   {
//     id: 4,
//     name: "Inception",
//     description:
//       "A thief who enters the dreams of others to steal their secrets finds himself involved in an even more complex heist.",
//     director: "Christopher Nolan",
//     releaseDate: "2010-07-16",
//   },
//   {
//     id: 5,
//     name: "The Shawshank Redemption",
//     description:
//       "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
//     director: "Frank Darabont",
//     releaseDate: "1994-09-23",
//   },
//   {
//     id: 6,
//     name: "Pulp Fiction",
//     description:
//       "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
//     director: "Quentin Tarantino",
//     releaseDate: "1994-10-14",
//   },
//   {
//     id: 7,
//     name: "The Matrix",
//     description:
//       "A computer programmer discovers that reality as he knows it is a simulation created by machines to subdue humanity.",
//     director: "Lana Wachowski, Lilly Wachowski",
//     releaseDate: "1999-03-31",
//   },
// ];

// // Now, each releaseDate is in the "YYYY-MM-DD" format.

// const users = [
//   {
//     id: 1,
//     username: "user1",
//     email: "user1@example.com",
//     password: "password1",
//   },
//   {
//     id: 2,
//     username: "user2",
//     email: "user2@example.com",
//     password: "password2",
//   },
//   {
//     id: 3,
//     username: "user3",
//     email: "user3@example.com",
//     password: "password3",
//   },
//   {
//     id: 4,
//     username: "user4",
//     email: "user4@example.com",
//     password: "password4",
//   },
//   {
//     id: 5,
//     username: "user5",
//     email: "user5@example.com",
//     password: "password5",
//   },
// ];

const resolvers = {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value: any) {
      return new Date(value); // value from the client
    },
    serialize(value: any) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(+ast.value); // ast value is always in string format
      }
      return null;
    },
  }),
  Query: {
    getUsers: async () => {
      return await prisma.User.findMany();
    },
    getUser: (parent: any, args: { id: number }) => {
      const user = prisma.User.findUnique({
        where: { id: args.id },
      });

      if (!user) {
        return null;
      }
      return user;
    },
    getMovies: async () => {
      return await prisma.movie.findMany();
    },
    getMovie: (parent: any, args: { id: number }) => {
      const movie = prisma.movie.findUnique({
        where: { id: args.id },
      });
      if (!movie) {
        return null;
      }
      return movie;
    },
    searchMovies: async (parent: any, args: { searchTerm: string }) => {
      // If a search term is provided, filter the movies by name or description
      if (args.searchTerm) {
        const movies = await prisma.movie.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: args.searchTerm,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: args.searchTerm,
                  mode: "insensitive",
                },
              },
            ],
          },
        });

        return movies;
      }

      // If no search term is provided, return an empty array or handle it as needed
      return [];
    },

    //sort by relase date (more user-frindly feature than sorting by an other filed)
    sortMovies: async (parent: any, args: { sort: string }) => {
      let orderBy = {};
      let sortBy = args.sort;

      if (sortBy) {
        // Parse the sortBy argument and set the appropriate ordering
        if (sortBy === "releaseDate_ASC") {
          orderBy = { name: "asc" };
        } else if (sortBy === "releaseDate_DESC") {
          orderBy = { name: "desc" };
        }
        // Add more sorting options as needed.
      }

      const movies = await prisma.movie.findMany({
        orderBy,
      });

      return movies;
    },
    getUserMovies: async () => {
      return prisma.UserMovies.findMany();
    },

    //allows filtering of movies based on user (can be done same with movieID but userId is more realistic)
    getUserMoviesByUserID: async (parent: any, args: { id: number }) => {
      const movies = prisma.UserMovies.findMany({
        where: { userId: args.id },
      });
      if (!movies) {
        return "No movies found for userID: " + args.id;
      }
      return movies;
    },

    //for small db this would work well but if we have millions of movies then skipping thousands would slow down this query
    //so offset pagination might not be ideal in that case
    moviePagination: async (parent: any, args: any) => {
      try {
        const results = await prisma.movie.findMany({
          skip: args.skip,
          take: args.take,
        });

        return results; // Ensure you return an array of movie objects
      } catch (error) {
        console.error("Error in moviePagination resolver:", error);
        throw new Error(
          "An error occurred while fetching movies for pagination."
        );
      }
    },
  },
  Mutation: {
    deleteMovie: async (parent: any, args: { id: number }) => {
      try {
        const deletedMovie = await prisma.movie.delete({
          where: { id: args.id }, // Use args.id directly
        });

        return deletedMovie;
      } catch (error: any) {
        return null;
      }
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
