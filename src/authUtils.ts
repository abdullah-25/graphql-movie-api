export function requireAuthentication(context: { user: any }) {
  if (!context.user) {
    throw new Error(
      "Unauthorized. You must be logged in to perform this action."
    );
  }
}
