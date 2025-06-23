# Roadmap App

This is a full-stack roadmap application that allows users to view, upvote, filter, sort and comment on roadmap items.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture Decisions](#architecture-decisions)
- [Future Improvements](#future-improvements)

## Project Overview

The goal of this application is to provide a platform where users can engage with a product's roadmap. While they cannot create roadmap items themselves, they can provide valuable feedback through upvotes and comments, fostering a collaborative environment.

## Features

- User authentication (Signup/Login)
- View a list of roadmap items as a Grid or List view
- Filter and sort roadmap items based on Status, Category, Popularity, and Creation Time
- Upvote roadmap items (one vote per user per item). Users can also remove their vote for a specific roadmap if they wish
- Add comments to roadmap items; Edit and delete comments
- Reply to comments in a nested/threaded format (up to 3 levels deep)
- Offset-Based Pagination

## Technology Stack

- **Frontend**: React (NextJS)
- **Styling**: Tailwind CSS
- **Backend**: NextJS
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL ([Neon](https://neon.com/))

## Architecture Decisions

- **Authentication:** Used [Better-Auth](https://www.better-auth.com/). Did not do the entire authentication flow manually to ensure time efficiency.
- **Framework:** Used Next.js because it is a full-stack framework, which allowed me to build both the frontend and backend together without needing to separate them. Besides, it has elevated Developer Experience, can be deployed easily using Vercel, has built-in Middleware support, and many other small features like automatic loading of Environment Variables.
- **Database and ORM:** Used PostgreSQL because it was easier to initiate the database with [Neon](https://neon.tech/) Serverless PostgreSQL Cloud Provider. In ORM, Drizzle was used because otherwise it would be risky, considering the complexity of maintaining raw SQL. Moreover, Drizzle has great TypeScript support, since I used TypeScript for the entire task.
- **Schema Validation:** Used Zod for schema validation because it's TypeScript-first as it infers types automatically, eliminating repetition. It also offers a clean, chainable API and proper (and easily customizable) error messages, making the validation quite developer-friendly. Additionally, its package size is very small, which is more plausible.
- **Comments and Replies:** Initially, for any Roadmap item, only the number of top-level comments is visible. Upon entering the Roadmap detail page, the user can see all the comments as well as the total number of replies to each comment. Additionally, users can view the reply section of a specific comment to see all replies associated with it. However, posting a reply to a comment does not increase the main comment count on the roadmap item. Instead, the reply count is only updated within the detailed roadmap page under that specific comment. This approach helps avoid complications with comment counts when any comment is deleted.
- **Pagination:** Chose offset-based pagination because it allows direct access to arbitrary pages, which suits our Roadmap app’s relatively stable dataset. Additionally, it is flexible and easy to implement due to its simplicity and for being less time-consuming.
- **Filtering and Sorting:** Used URL-based filtering and sorting because it improves shareability, persistence, and navigation, making it more user and SEO-friendly compared to state-only solutions.

## Future Improvements

- We can introduce [shadcn](https://ui.shadcn.com/) to implement the UI, since it combines Radix UI primitives with Tailwind CSS, offering accessible, customizable, and production-ready components
- Use React-Hook-Form to handle any form with more scalability and optimized maintenance
- Implement better User Readable Error Messages
- Verify User Emails
- Add both “Upvote” and “Downvote” functionality in Roadmap items, as well as comments and replies
- Offer a User Profile section
- Implement “Forgot Password” and “Change Password” functionality
