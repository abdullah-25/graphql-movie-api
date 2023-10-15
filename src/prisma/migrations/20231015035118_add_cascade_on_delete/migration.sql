-- DropForeignKey
ALTER TABLE "UserMovies" DROP CONSTRAINT "UserMovies_movieId_fkey";

-- AddForeignKey
ALTER TABLE "UserMovies" ADD CONSTRAINT "UserMovies_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
