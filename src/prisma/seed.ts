const { prisma } = require("../db"); // Adjust the path to your db.ts file

const main = async () => {
  try {
    // Create seed data for User model
    const user1 = await prisma.User.create({
      data: {
        username: "user1",
        email: "user1@mock.com",
        password: "password",
      },
    });

    const user2 = await prisma.User.create({
      data: {
        username: "user2",
        email: "user2@mock.com",
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

    console.log("Seed data created successfully!");
  } catch (error) {
    console.error("Error creating seed data:", error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
