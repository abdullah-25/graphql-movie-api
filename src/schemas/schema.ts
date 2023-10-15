import { gql } from "apollo-server";
import { GraphQLScalarType, Kind } from "graphql";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { APP_SECRET } from "../auth";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { User } from "@prisma/client";
import { Movie } from "@prisma/client";
import { UserMovies } from "@prisma/client";
import { GraphQLContext } from "../context";

const { prisma } = require("../db");

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
    me: User!
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
    signup(email: String!, password: String!, username: String!): AuthPayload
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
    // me: (parent: unknown, args: {}) => {
    //   if (currentUser === null) {
    //     throw new Error("Unauthenticated!");
    //   }

    //   return context.currentUser;
    // },
    getUsers: async () => {
      return await prisma.user.findMany();
    },
    //   getUser: (parent: any, args: { id: number }, context: GraphQLContext) => {
    //     const user = prisma.User.findUnique({
    //       where: { id: args.id },
    //     });

    //     if (!user) {
    //       return null;
    //     }
    //     return user;
    //   },
    //   getMovies: async (context: GraphQLContext) => {
    //     return await prisma.movie.findMany();
    //   },
    //   getMovie: (parent: any, args: { id: number }, context: GraphQLContext) => {
    //     const movie = prisma.movie.findUnique({
    //       where: { id: args.id },
    //     });
    //     if (!movie) {
    //       return null;
    //     }
    //     return movie;
    //   },
    //   searchMovies: async (parent: any, args: { searchTerm: string }, context: GraphQLContext) => {
    //     // If a search term is provided, filter the movies by name or description
    //     if (args.searchTerm) {
    //       const movies = await prisma.movie.findMany({
    //         where: {
    //           OR: [
    //             {
    //               name: {
    //                 contains: args.searchTerm,
    //                 mode: "insensitive",
    //               },
    //             },
    //             {
    //               description: {
    //                 contains: args.searchTerm,
    //                 mode: "insensitive",
    //               },
    //             },
    //           ],
    //         },
    //       });

    //       return movies;
    //     }

    //     // If no search term is provided, return an empty array or handle it as needed
    //     return [];
    //   },

    //   //sort by relase date (more user-frindly feature than sorting by an other filed)
    //   sortMovies: async (parent: any, args: { sort: string }, context: GraphQLContext) => {
    //     let orderBy = {};
    //     let sortBy = args.sort;

    //     if (sortBy) {
    //       // Parse the sortBy argument and set the appropriate ordering
    //       if (sortBy === "releaseDate_ASC") {
    //         orderBy = { name: "asc" };
    //       } else if (sortBy === "releaseDate_DESC") {
    //         orderBy = { name: "desc" };
    //       }
    //       // Add more sorting options as needed.
    //     }

    //     const movies = await prisma.movie.findMany({
    //       orderBy,
    //     });

    //     return movies;
    //   },
    //   getUserMovies: async (context: GraphQLContext) => {
    //     return prisma.UserMovies.findMany();
    //   },

    //   //allows filtering of movies based on user (can be done same with movieID but userId is more realistic)
    //   getUserMoviesByUserID: async (parent: any, args: { id: number }, context: GraphQLContext) => {
    //     const movies = prisma.UserMovies.findMany({
    //       where: { userId: args.id },
    //     });
    //     if (!movies) {
    //       return "No movies found for userID: " + args.id;
    //     }
    //     return movies;
    //   },

    //   //for small db this would work well but if we have millions of movies then skipping thousands would slow down this query
    //   //so offset pagination might not be ideal in that case
    //   moviePagination: async (parent: any, args: any, context: GraphQLContext) => {
    //     try {
    //       const results = await prisma.movie.findMany({
    //         skip: args.skip,
    //         take: args.take,
    //       });

    //       return results; // Ensure you return an array of movie objects
    //     } catch (error) {
    //       console.error("Error in moviePagination resolver:", error);
    //       throw new Error(
    //         "An error occurred while fetching movies for pagination."
    //       );
    //     }
    //   },
    // },
  },
  Mutation: {
    signup: async (
      parent: unknown,
      args: { email: string; password: string; username: string },
      context: any
    ) => {
      // 1
      const password = await hash(args.password, 10);

      // 2
      const user = await context.prisma.user.create({
        data: { ...args, password },
      });

      // 3
      const token = sign({ userId: user.id }, APP_SECRET);

      // 4
      return {
        token,
        user,
      };
    },
    login: async (
      parent: unknown,
      args: { email: string; password: string },
      context: any
    ) => {
      // 1
      const user = await context.prisma.user.findUnique({
        where: { email: args.email },
      });
      if (!user) {
        throw new Error("No such user found");
      }

      // 2
      const valid = await compare(args.password, user.password);
      if (!valid) {
        throw new Error("Invalid password");
      }

      const token = sign({ userId: user.id }, APP_SECRET);

      // 3
      return {
        token,
        user,
      };
    },
    //   deleteMovie: async (parent: any, args: { id: number }, context: GraphQLContext) => {
    //     try {
    //       const deletedMovie = await prisma.movie.delete({
    //         where: { id: args.id },
    //       });

    //       // Check if the movie was successfully deleted
    //       if (deletedMovie) {
    //         return {
    //           id: deletedMovie.id, // Return the ID of the deleted movie
    //           success: true,
    //           message: "Movie deleted successfully",
    //         };
    //       } else {
    //         // Return a response indicating that the movie was not found
    //         return {
    //           id: null, // Return null for the ID in case of failure
    //           success: false,
    //           message: "Movie not found or failed to delete",
    //         };
    //       }
    //     } catch (error: any) {
    //       // Return an error response
    //       return {
    //         id: null, // Return null for the ID in case of an error
    //         success: false,
    //         message: "An error occurred while deleting the movie",
    //       };
    //     }
    //   },
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
