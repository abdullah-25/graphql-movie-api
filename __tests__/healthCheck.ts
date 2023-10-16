const { server } = require("../src/server");
import { gql } from "apollo-server";
import { it, expect } from "@jest/globals";

it("should validate user info correctly", async () => {
  const result = await server.executeOperation({
    query: gql`
      mutation {
        login(
          credentials: { email: "bob@test.com", username: "bob", password: "" }
        )
      }
    `,
  });
  expect(result).toBeTruthy();
  expect(result.errors).toBeTruthy();
});
