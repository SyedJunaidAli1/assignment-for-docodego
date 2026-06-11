# Survey Builder Frontend

Frontend application for the Survey Builder platform built with React, TypeScript, Vite, TanStack Router, TanStack Query, Tailwind CSS, and Axios.

## Features

### Authentication

* User Sign Up
* User Sign In
* JWT Authentication
* Protected API Requests

### Survey Management

* View User Surveys
* Create Survey
* Delete Survey

### Question Management

* View Survey Questions
* Create Question
* Delete Question

### Public Survey Access

* View Public Surveys
* Submit Survey Responses

### Responses

* View Submitted Responses
* Display Questions with Corresponding Answers

---

## Tech Stack

* React 19
* TypeScript
* Vite
* TanStack Router
* TanStack Query
* Axios
* Tailwind CSS

---

## Project Structure

```txt
src/
├── routes/
├── components/
├── hooks/
├── lib/
│   └── api.ts
├── types/
├── main.tsx
└── index.css
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

Build for production:

```bash
pnpm build
```

Preview production build:

```bash
pnpm preview
```

---

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8787
```

For production:

```env
VITE_API_URL=https://your-worker.workers.dev
```

---

## Authentication Flow

### Sign Up

Users can create an account using:

```txt
Email
Password
```

After successful registration, users are redirected to the Sign In page.

### Sign In

Users authenticate using:

```txt
Email
Password
```

After successful authentication:

* JWT token is stored in localStorage
* User is redirected to Dashboard

Example:

```ts
localStorage.setItem("token", token);
```

---

## API Integration

Axios is configured with a shared API instance.

```ts
Authorization: Bearer <token>
```

is automatically attached to authenticated requests.

---

## TanStack Query

The application uses TanStack Query for:

* Data Fetching
* Mutations
* Query Invalidation
* Loading States
* Error Handling

Custom hooks are located in:

```txt
src/hooks/
```

Examples:

```txt
useGetSurveys
useCreateSurvey
useDeleteSurvey

useGetQuestions
useCreateQuestion
useDeleteQuestion

useGetResponses
useSubmitResponse
```

---

## Routes

### Public Routes

```txt
/
/signin
/signup
/survey/:surveyId
```

### Protected Routes

```txt
/dashboard
/surveys/:surveyId
/surveys/:surveyId/responses
```

---

## Dashboard

Features:

* View Surveys
* Create Survey
* Delete Survey
* Navigate to Survey Details

---

## Survey Details

Features:

* View Questions
* Add Questions
* Delete Questions

Supported question types:

```txt
Text
Multiple Choice
```

---

## Public Survey

Users can:

* Open Survey Link
* Answer Questions
* Submit Responses

Example submission:

```json
{
  "answers": {
    "1": "React",
    "2": "2 years",
    "3": "5"
  }
}
```

Question IDs are used as keys and answers are submitted to the backend.

---

## Responses Page

Survey owners can:

* View Survey Responses
* Review Submitted Answers

Responses are mapped to their corresponding questions using question IDs.

---

## Deployment

### Frontend

Deploy to Vercel:

```bash
pnpm build
```

Configure:

```env
VITE_API_URL=https://your-worker.workers.dev
```

### Backend

Deploy separately using Cloudflare Workers.

---

## Future Improvements

* Edit Survey
* Edit Question
* Route Guards
* Better Form Validation
* Loading Skeletons
* Toast Notifications
* User Profile Page
* Analytics Dashboard

---

## Author

Built as part of a Survey Builder internship assignment using React, TypeScript, TanStack Router, TanStack Query, Cloudflare Workers, and Cloudflare D1.
