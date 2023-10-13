import { gql } from "apollo-server";
// import { PrismaClient } from "@prisma/client";

import { GraphQLScalarType, Kind } from "graphql";

// const prisma = new PrismaClient();

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
  }

  type Mutation {
    createUser(data: UserInput!): User!
    updateUser(id: Int!, data: UserInput!): User!
    deleteUser(id: Int!): User!
    createMovie(data: MovieInput!): Movie!
    updateMovie(id: Int!, data: MovieInput!): Movie!
    deleteMovie(id: Int!): Movie!
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

const movies = [
  {
    id: 3,
    name: "Chrostopher Nolan",
    description:
      "The plot follows the vigilante Batman, police lieutenant James Gordon, and district attorney Harvey Dent, who form an alliance to dismantle organized crime in Gotham City",
    director: "Takashi Shimizu",
    releaseDate: "2008-07-18",
  },
  {
    id: 4,
    name: "Inception",
    description:
      "A thief who enters the dreams of others to steal their secrets finds himself involved in an even more complex heist.",
    director: "Christopher Nolan",
    releaseDate: "2010-07-16",
  },
  {
    id: 5,
    name: "The Shawshank Redemption",
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    director: "Frank Darabont",
    releaseDate: "1994-09-23",
  },
  {
    id: 6,
    name: "Pulp Fiction",
    description:
      "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    director: "Quentin Tarantino",
    releaseDate: "1994-10-14",
  },
  {
    id: 7,
    name: "The Matrix",
    description:
      "A computer programmer discovers that reality as he knows it is a simulation created by machines to subdue humanity.",
    director: "Lana Wachowski, Lilly Wachowski",
    releaseDate: "1999-03-31",
  },
];

// Now, each releaseDate is in the "YYYY-MM-DD" format.

const users = [
  {
    id: 1,
    username: "user1",
    email: "user1@example.com",
    password: "password1",
  },
  {
    id: 2,
    username: "user2",
    email: "user2@example.com",
    password: "password2",
  },
  {
    id: 3,
    username: "user3",
    email: "user3@example.com",
    password: "password3",
  },
  {
    id: 4,
    username: "user4",
    email: "user4@example.com",
    password: "password4",
  },
  {
    id: 5,
    username: "user5",
    email: "user5@example.com",
    password: "password5",
  },
];

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
    getUsers: () => {
      return users;
    },
    getUser: (parent: any, args: number) => {
      const user = users.find((user) => user.id === args);
      if (!user) {
        throw new Error(`User with ID ${args} not found`);
      }
      return user;
    },
    getMovies: () => {
      return movies;
    },
    getMovie: (parent: any, args: number) => {
      const movie = movies.find((movie) => movie.id === args);
      if (!movie) {
        return `Movie with ID ${args} not found`;
      }
      return movie;
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};