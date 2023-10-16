# GraphQL and Prisma CRUD API

A simple CRUD (Create, Read, Update, Delete) API project built with GraphQL and PostgreSQL using Prisma.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [GraphQL Schema](#graphql-schema)
- [Database Schema](#database-schema)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Sample Queries and Mutations](#sample-queries-and-mutations)


## Overview

This project is a simple GraphQL API that provides CRUD operations for managing data related to user profiles and movies. It uses GraphQL for querying and modifying the data and PostgreSQL with Prisma as the database. The project is organized to demonstrate how to create, retrieve, update, and delete movie and user records. JWT is implemented for user auth and only verified and authenticated users are granted access to CRUD operations.

## Demo

- part 1: https://www.loom.com/share/c5b85e09095e418ea55203e0a847e0eb?sid=e1dc49fa-db75-4493-aabc-7a98bfc48672
- part 2: https://www.loom.com/share/5619b057aed34bcd9255eed2a1e7f4e3?sid=d1e58adf-b491-4cfb-8754-058bed17d70a

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed.
- PostgreSQL database server installed.
- Prisma CLI installed (`npm install -g prisma`).

## Getting Started

To get started with this project, follow these steps:

1. Clone this repository to your local machine:

   ```shell
   git clone https://github.com/your-username/your-project-name.git
   cd your-project-name
   npm install

2. Set up your PostgreSQL database and create a .env file to store environment variables. You'll need to define a DATABASE_URL variable with your PostgreSQL connection string.
  ```shell
  touch .env

  Add the following to your .env file:
  DATABASE_URL="postgresql://username:password@localhost:5432/database-name"
```
3. Set up the Prisma client by running migrations:

```shell
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

4. Seed the database with initial data (optional):
```shell
node prisma/seed.js
```

5. Start the development server:
```shell
npm start
```

Your GraphQL CRUD API should now be up and running.

## Project Structure

The project structure is organized as follows:

- src/ - Contains the main source code of the GraphQL server.
- prisma/ - Contains Prisma schema and database seeding scripts.
- db.ts - The Prisma client configuration.
- schema/ - Contains GraphQL schema (typeDef and resolvers)
- server/ -code to start and run server
- __tests__/ -contains code for unit testing
  
##GraphQL Schema
The GraphQL schema for this project defines the data model, queries, mutations, and types. You can find the schema in the schema/ directory.

##Database Schema
The database schema is defined in the prisma/schema.prisma file. It specifies the structure of your PostgreSQL database and is used to generate the Prisma client.

##Running the Project
To run the project, execute the following command:

```shell
npm start
```

Your GraphQL API will be available at http://localhost:3000.

## API Endpoints
GET /graphql - The GraphQL endpoint for querying and manipulating data.

## Sample Queries and Mutations
Here are some sample queries and mutations that you can use to interact with the API:

1. Query all movies:

graphql

```shell
qquery GetMovies {
    getMovies {
        id
        name
        description
        director
        releaseDate
    }
}
```

2. Create a new Movie:
   
```shell
mutation CreateMovie {
    createMovie(
        data: {
            name: "test"
            description: "test"
            director: "test"
            releaseDate: "2022-02-02"
        }
    ) {
        id
        name
        description
        director
        releaseDate
    }
}
```

3. Update an existing Movie:

```shell

mutation UpdateMovie {
    updateMovie(
        id: 3
        data: {
            name: "test"
            description: "test"
            director: "test"
            releaseDate: "2021-02-03"
        }
    ) {
        id
        name
        description
        director
        releaseDate
    }
}
```

4. Delete a movie by ID:

```shell
mutation DeleteMovie {
    deleteMovie(id: 2) {
        id
        name
        description
        director
        releaseDate
    }
}
```


Enjoy using your GraphQL and Prisma-backed CRUD API!
