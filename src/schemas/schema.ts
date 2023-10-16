import { gql } from "apollo-server";
const { prisma } = require("../db");
import { GraphQLScalarType, Kind } from "graphql";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { SECRET } from "../server";

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
    filterMovies(nameContains: String, directorContains: String): [Movie!]!
    searchMovies(searchTerm: String): [Movie!]!
    sortMovies(sortBy: String): [Movie!]!
    moviePagination(skip: Int!, take: Int!): [Movie!]!
  }

  type Error {
    message: String!
    code: String
  }

  type Mutation {
    signup(email: String!, password: String!, username: String!): User!
    login(email: String!, password: String!): String
    changePassword(email: String!, password: String!): PasswordChangeResponse
    deleteUser(id: Int!): User!
    createMovie(data: MovieInput!): Movie!
    updateMovie(id: Int!, data: MovieInput!): Movie!
    deleteMovie(id: Int!): Movie!
  }

  type DeleteMovieResponse {
    movie: Movie
    error: Error
  }

  type CreateUserResponse {
    user: User
    error: Error
  }

  type PasswordChangeResponse {
    success: Boolean
    message: String
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
    sortMovies: async (parent: any, args: { sort: string }) => {
      if (args.sort !== "name_ASC" && args.sort !== "name_DESC") {
        throw new Error(
          "Invalid sorting option. Available options: name_ASC, name_DESC"
        );
      }

      let orderBy = {};
      let sortBy = args.sort;

      if (sortBy) {
        // Parse the sortBy argument and set the appropriate ordering
        if (sortBy === "name_ASC") {
          orderBy = { name: "asc" };
        } else if (sortBy === "name_DESC") {
          orderBy = { name: "desc" };
        }
        // Add more sorting options as needed.
      }

      const movies = await prisma.movie.findMany({
        orderBy,
      });

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

    //In filterMovies, if nameContains or directorContains arguments are provided, it constructs a where clause that specifies the filtering criteria.
    //This allows you to filter movies based on partial matches of the movie name and director.
    filterMovies: async (
      parent: any,
      args: { nameContains?: string; directorContains?: string }
    ) => {
      const filter = {
        ...(args.nameContains && {
          name: { contains: args.nameContains, mode: "insensitive" },
        }),
        ...(args.directorContains && {
          director: { contains: args.directorContains, mode: "insensitive" },
        }),
      };

      const movies = await prisma.movie.findMany({
        where: filter,
      });

      return movies;
    },
  },
  Mutation: {
    signup: async (
      parent: unknown,
      args: { email: string; password: string; username: string }
    ) => {
      const password = await hash(args.password, 12);
      const user = await prisma.user.create({
        data: { ...args, password },
      });
      return user;
    },
    login: async (
      parent: unknown,
      args: { email: string; password: string },
      contextValue: any
    ) => {
      // 1
      const user = await prisma.user.findUnique({
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

      const token = sign({ userId: user.id }, SECRET);

      // 3
      return {
        token,
        user,
      };
    },
    changePassword: async (
      parent: any,
      args: { email: string; password: string },
      context: any
    ) => {
      // check to see if user is unauthorised
      if (!context.user) {
        throw new Error(
          "Unauthorized. You must be logged in to change your password."
        );
      }
      try {
        const hashedPassword = await hash(args.password, 12);
        const updatePassword = await prisma.user.update({
          where: {
            email: args.email,
          },
          data: {
            password: hashedPassword,
          },
        });
        if (!updatePassword) {
          throw new Error("User not found. Password change failed.");
        }
        return {
          success: true,
          message: "Password change successful!",
        };
      } catch (error: any) {
        throw new Error(`Password change failed: ${error.message}`);
      }
    },
    createMovie: async (parent: any, args: any, context: any) => {
      // check to see if user is unauthorised
      if (!context.user) {
        throw new Error(
          "Unauthorized. You must be logged in to create a movie."
        );
      }
      try {
        const releaseDate = new Date(args.data.releaseDate);

        const newMovie = await prisma.movie.create({
          data: {
            name: args.data.name,
            description: args.data.description,
            director: args.data.director,
            releaseDate: releaseDate, // Use the parsed releaseDate
          },
        });

        return newMovie;
      } catch (error: any) {
        throw new Error(`Error Creating movie: ${error.message}`);
      }
    },
    updateMovie: async (parent: any, args: any, context: any) => {
      // check to see if user is unauthorised
      if (!context.user) {
        throw new Error(
          "Unauthorized. You must be logged in to update this movie."
        );
      }
      try {
        const releaseDate = new Date(args.data.releaseDate);

        const updatedMovie = await prisma.movie.update({
          where: { id: args.id },
          data: {
            name: args.data.name,
            description: args.data.description,
            director: args.data.director,
            releaseDate: releaseDate, // Use the parsed releaseDate
          },
        });

        return updatedMovie;
      } catch (error: any) {
        throw new Error(`Error Updating movie: ${error.message}`);
      }
    },

    deleteMovie: async (parent: any, args: { id: number }, context: any) => {
      // check to see if user is unauthorised
      if (!context.user) {
        throw new Error(
          "Unauthorized. You must be logged in to delete this movie."
        );
      }
      try {
        const deletedMovie = await prisma.movie.delete({
          where: { id: args.id }, // Use args.id directly
        });

        return deletedMovie;
      } catch (error: any) {
        throw new Error(`Error deleting movie: ${error.message}`);
      }
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
