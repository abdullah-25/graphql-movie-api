//const { prisma } = require("../db"); // Adjust the path to your db.ts file

const main = async () => {
  try {
    // Create seed data for User model
    const user1 = await prisma.User.create({
      data: {
        username: "newUser",
        email: "user1234@mock.com",
        password: "password",
      },
    });

    const user2 = await prisma.User.create({
      data: {
        username: "user12",
        email: "user2223@mock.com",
        password: "passwordnew",
      },
    });

    // Create seed data for Movie model
    const movie1 = await prisma.Movie.create({
      data: {
        name: "Inception",
        description:
          "A thief who enters the dreams of others to steal their secrets finds himself involved in an even more complex heist.",
        director: "Christopher Nolan",
        releaseDate: new Date("2010-07-16"),
      },
    });

    const movie2 = await prisma.Movie.create({
      data: {
        name: "The Shawshank Redemption",
        description:
          "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        director: "Frank Darabont",
        releaseDate: new Date("1994-09-23"),
      },
    });

    const movie3 = await prisma.Movie.create({
      data: {
        name: "The Matrix",
        description:
          "A computer programmer discovers that reality as he knows it is a simulation created by machines to subdue humanity.",
        director: "Lana Wachowski, Lilly Wachowski",
        releaseDate: new Date("1999-03-31"),
      },
    });

    const movie4 = await prisma.Movie.create({
      data: {
        name: "The Dark Night",
        description:
          "The plot follows the vigilante Batman, police lieutenant James Gordon, and district attorney Harvey Dent, who form an alliance to dismantle organized crime in Gotham City",
        director: "Chrostopher Nolan",
        releaseDate: new Date("2008-07-18"),
      },
    });

    const movie5 = await prisma.Movie.create({
      data: {
        name: "Pulp Fiction",
        description:
          "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        director: "Quentin Tarantino",
        releaseDate: new Date("1994-10-14"),
      },
    });

    // Create seed data for UserMovies model
    await prisma.UserMovies.create({
      data: {
        userId: user1.id,
        movieId: movie1.id,
      },
    });

    await prisma.UserMovies.create({
      data: {
        userId: user2.id,
        movieId: movie2.id,
      },
    });
    await prisma.UserMovies.create({
      data: {
        userId: user2.id,
        movieId: movie1.id,
      },
    });
    await prisma.UserMovies.create({
      data: {
        userId: user2.id,
        movieId: movie3.id,
      },
    });
    await prisma.UserMovies.create({
      data: {
        userId: user2.id,
        movieId: movie4.id,
      },
    });
    await prisma.UserMovies.create({
      data: {
        userId: user1.id,
        movieId: movie5.id,
      },
    });

    console.log("Seed data created successfully!");
  } catch (error) {
    console.error("Error creating seed data:", error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
