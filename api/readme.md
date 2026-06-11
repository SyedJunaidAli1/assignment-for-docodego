# Survey Builder Backend

Backend API for a Survey Builder application built with Hono, Cloudflare Workers, Cloudflare D1, JWT Authentication, and TypeScript.

## Features

- User Authentication
  - Sign Up
  - Sign In
  - JWT-based Authentication
  - Protected Routes

- Survey Management
  - Create Survey
  - Get User Surveys
  - Get Survey By ID
  - Delete Survey

- Question Management
  - Create Question
  - Get Survey Questions
  - Delete Question

- Survey Responses
  - Submit Public Responses
  - View Survey Responses

- Authorization
  - Users can only manage their own surveys
  - Users can only view their own survey responses

---

## Tech Stack

- Hono
- TypeScript
- Cloudflare Workers
- Cloudflare D1
- JWT
- bcryptjs

---

## Project Structure

```txt
src/
├── middleware/
│   └── auth.ts
├── utils/
│   └── jwt.ts
├── index.ts
```

---

## Environment Variables

Configure the following variables in Wrangler:

```json
{
  "vars": {
    "JWT_SECRET": "your-secret-key"
  }
}
```

---

## Database Schema

### User

```sql
CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Surveys

```sql
CREATE TABLE surveys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Questions

```sql
CREATE TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id INTEGER NOT NULL,
  question TEXT NOT NULL,
  type TEXT NOT NULL,
  options_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Responses

```sql
CREATE TABLE responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id INTEGER NOT NULL,
  answers_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Installation

Install dependencies:

```bash
pnpm install
```

Run development server:

```bash
pnpm dev
```

---

## Deploy

Deploy to Cloudflare Workers:

```bash
npx wrangler deploy
```

---

# API Documentation

## Authentication

### Sign Up

```http
POST /api/auth/signup
```

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### Sign In

```http
POST /api/auth/signin
```

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "token": "jwt-token"
}
```

---

### Get Current User

```http
GET /api/me
```

Headers:

```http
Authorization: Bearer <token>
```

---

## Surveys

### Get User Surveys

```http
GET /api/surveys
```

### Create Survey

```http
POST /api/surveys
```

Request:

```json
{
  "title": "Developer Survey",
  "description": "Survey for developers"
}
```

### Get Survey By ID

```http
GET /api/surveys/:id
```

### Delete Survey

```http
DELETE /api/surveys/:id
```

---

## Questions

### Get Survey Questions

```http
GET /api/surveys/:id/questions
```

### Create Question

```http
POST /api/surveys/:id/questions
```

Request:

```json
{
  "question": "Favorite framework?",
  "type": "text"
}
```

For multiple choice:

```json
{
  "question": "Favorite framework?",
  "type": "multiple_choice",
  "options": ["React", "Vue", "Angular"]
}
```

### Delete Question

```http
DELETE /api/questions/:id
```

---

## Public Survey APIs

### Get Public Survey

```http
GET /api/public/surveys/:id
```

Returns survey information and questions.

### Submit Survey Response

```http
POST /api/public/surveys/:id/responses
```

Request:

```json
{
  "answers": {
    "1": "React",
    "2": "2 years",
    "3": "5"
  }
}
```

Question IDs are used as keys and answers are stored in JSON format.

---

## Responses

### Get Survey Responses

```http
GET /api/surveys/:id/responses
```

Returns all responses submitted for the survey.

---

## Authorization

All protected endpoints require:

```http
Authorization: Bearer <jwt-token>
```

Users can only access and manage surveys that belong to them.

---

## Note

i know this is not production ready code. in this assignment i used lot of new things so my main focus was on working assignemnt. i never used before hono, cloudflare workers, cloudflare d1. i focused on working assigment rather than production readiness.
