# Course Management System

A REST API for managing courses, student accounts, and course enrollments.

## Technology stack

- Node.js
- Express 5
- TypeScript
- PostgreSQL
- Prisma ORM 7 with PostgreSQL driver adapter
- JWT authentication
- bcrypt password hashing
- Middleware-based authentication and role authorization
- dotenv and tsx

## Requirements

- Node.js (LTS recommended)
- PostgreSQL
- npm

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a PostgreSQL database named `course_management`.

3. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET` to your local values.

4. Generate the Prisma client:

   ```bash
   npm run prisma:generate
   ```

5. Create the database tables:

   ```bash
   npm run prisma:migrate -- --name init
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

The API runs at `http://localhost:3000`.

## Important note about the first administrator

Public registration always creates a `STUDENT` account. To create an administrator, register an account and then update that user's `role` to `ADMIN` directly in your local PostgreSQL database, for example:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

Do not expose administrator role assignment in the public registration endpoint.

## Endpoints

### Authentication

- `POST /api/auth/register` — create a student account.
- `POST /api/auth/login` — sign in and receive a JWT.
- `GET /api/auth/me` — get the signed-in user's profile; requires `Authorization: Bearer <token>`.

Register body:

```json
{
  "name": "Student One",
  "email": "student@example.com",
  "password": "StrongPass123"
}
```

Login body:

```json
{
  "email": "student@example.com",
  "password": "StrongPass123"
}
```

### Courses

- `GET /api/courses` — list courses.
- `GET /api/courses/:id` — get one course.
- `POST /api/courses` — create a course; administrator token required.
- `PATCH /api/courses/:id` — update a course; administrator token required.
- `DELETE /api/courses/:id` — delete a course; administrator token required.

Create course body:

```json
{
  "title": "Introduction to Programming",
  "description": "A beginner-friendly course",
  "capacity": 25
}
```

### Enrollments

All enrollment endpoints require a logged-in user token.

- `POST /api/enrollments/:courseId` — enroll in a course.
- `GET /api/enrollments/me/list` — list your enrollments.
- `DELETE /api/enrollments/:courseId` — cancel your enrollment.

## Authentication

Pass the token in the request header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

## Project structure

```text
src/
  controllers/   Request handling and responses
  lib/           Prisma client and PostgreSQL adapter
  middlewares/   Authentication, authorization, and error handling
  routes/        API route definitions
  server.ts      Express application entry point
  types/         Express request type extension
prisma/
  schema.prisma  Database models
prisma.config.ts Prisma 7 configuration
```

## Scope and limitations

This is a learning-project starter, not a production-ready system. Before production use, add automated tests, stronger request validation, rate limiting, logging, and a concurrency-safe transaction for enforcing course capacity.
