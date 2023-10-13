const { prisma } = require("../db"); // Adjust the path to your db.ts file

async function seed() {
  try {
    const user1 = await prisma.user.create({
      data: {
        username: "user1",
        email: "user1@example.com",
        password: "password1",
        movies: {
          create: [
            {
              name: "Inception",
              description:
                "A thief who enters the dreams of others to steal their secrets finds himself involved in an even more complex heist.",
              director: "Christopher Nolan",
              releaseDate: new Date("2010-07-16"),
            },
            {
              name: "The Shawshank Redemption",
              description:
                "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
              director: "Frank Darabont",
              releaseDate: new Date("1994-09-23"),
            },
          ],
        },
      },
    });

    const user2 = await prisma.user.create({
      data: {
        username: "user2",
        email: "user2@example.com",
        password: "password2",
        movies: {
          create: [
            {
              name: "Pulp Fiction",
              description:
                "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
              director: "Quentin Tarantino",
              releaseDate: new Date("1994-10-14"),
            },
            {
              name: "The Matrix",
              description:
                "A computer programmer discovers that reality as he knows it is a simulation created by machines to subdue humanity.",
              director: "Lana Wachowski, Lilly Wachowski",
              releaseDate: new Date("1999-03-31"),
            },
          ],
        },
      },
    });

    // Add more users and movies as needed

    console.log("Mock data seeded successfully.");
  } catch (error) {
    console.error("Error seeding mock data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
