# Roadmap App

### Date: June 10, 2025

Almost completed the backend setup like middleware, auth lib, and schemas. The next target is to implement the sign-in and sign-up frontend first, and then again move to the backend to implement to fetch roadmaps, upvote and comment on roadmaps.

Things I did in this patch:

- Added middleware for auth
- Added auth file and api route for better-auth setup
- Added schemas for user, roadmap, upvote, and comment
  - for the user schema, i used `better-auth`'s `generate` command (`bunx @better-auth/cli generate --output ./src/db/auth-schema.ts`) which generated the auth schema in `src/db/auth-schema.ts`. i had to do some modifications for the schema to work with the latest version of drizzle, but the main structure is the same.
  - i also moved different schemas to their corresponding files in `src/db/schemas/` instead of having them all in `src/db/schema.ts`. this way is more organized and easier to maintain.
    - added a `src/db/schemas/index.ts` file to export all schemas from `src/db/schemas/`
