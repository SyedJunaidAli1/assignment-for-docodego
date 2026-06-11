import { Hono } from "hono";
import { hash } from "bcryptjs";
import { compare } from "bcryptjs";
import { generateToken } from "./utils/jwt";
import { authMiddleware } from "./middleware/auth";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.get("/api/health", (c) => c.json({ status: "ok" }));

//authenticaion

app.get("/api/me", authMiddleware, async (c) => {
  const user = c.get("user");

  return c.json(user);
});

app.post("/api/auth/signup", async (c) => {
  const body = await c.req.json();

  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "All fields are required" }, 400);
  }

  const existingUser = await c.env.DB.prepare(
    "SELECT id FROM user WHERE email = ?",
  )
    .bind(email)
    .first();

  if (existingUser) {
    return c.json({ error: "User already exists" }, 409);
  }

  const hashedPassword = await hash(password, 10);

  await c.env.DB.prepare("INSERT INTO user (email, password) VALUES (?, ?)")
    .bind(email, hashedPassword)
    .run();

  return c.json(
    {
      success: true,
      message: "User created successfully",
    },
    201,
  );
});

app.post("/api/auth/signin", async (c) => {
  try {
    const body = await c.req.json();

    const { email, password } = body;

    if (!email || !password) {
      return c.json(
        {
          error: "Email and password are required",
        },
        400,
      );
    }

    const user = await c.env.DB.prepare("SELECT * FROM user WHERE email = ?")
      .bind(email)
      .first<{
        id: number;
        email: string;
        password: string;
      }>();

    if (!user) {
      return c.json(
        {
          error: "Invalid credentials",
        },
        401,
      );
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return c.json(
        {
          error: "Invalid credentials",
        },
        401,
      );
    }

    const token = generateToken(
      {
        id: user.id,
        email: user.email,
      },
      c.env.JWT_SECRET,
    );

    return c.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        success: false,
        error: "Something went wrong",
      },
      500,
    );
  }
});

// survey
app.post("/api/surveys", authMiddleware, async (c) => {
  const body = await c.req.json();

  const { title, description } = body;
  if (!title) {
    return c.json({ error: "Title is required" });
  }
  try {
    const user = c.get("user");
    const result = await c.env.DB.prepare(
      "INSERT INTO surveys (user_id, title, description) VALUES (?, ?, ?)",
    )
      .bind(user.id, title, description)
      .run();

    return c.json({ success: true, id: result.meta.last_row_id });
  } catch {
    return c.json({ success: false, error: "failed to create surveys" }, 500);
  }
});

app.get("/api/surveys", authMiddleware, async (c) => {
  const user = c.get("user");

  const result = await c.env.DB.prepare(
    "SELECT * FROM surveys WHERE user_id = ?",
  )
    .bind(user.id)
    .all();

  return c.json(result.results);
});

app.get("/api/surveys/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");

  const result = await c.env.DB.prepare(
    "SELECT * FROM surveys WHERE id = ? AND user_id = ?",
  )
    .bind(id, user.id)
    .first();

  if (!result) {
    return c.json({ error: "Survey not found" });
  }
  return c.json(result);
});

app.delete("/api/surveys/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  try {
    const result = await c.env.DB.prepare("SELECT id FROM surveys WHERE id = ?")
      .bind(id)
      .first();

    if (!result) {
      return c.json({ error: "Survey not found" }, 404);
    }
    const user = c.get("user");
    await c.env.DB.prepare("DELETE FROM surveys WHERE id = ? AND user_id = ?")
      .bind(id, user.id)
      .run();
    return c.json({ success: true, message: "Survey deleted" });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Falied to delete survey" }, 500);
  }
});

//questions
app.post("/api/surveys/:id/questions", authMiddleware, async (c) => {
  const surveyId = c.req.param("id");

  const body = await c.req.json();

  const { question, type, options } = body;

  if (!question || !type) {
    return c.json(
      {
        error: "Question and type are required",
      },
      400,
    );
  }

  const user = c.get("user");

  const survey = await c.env.DB.prepare(
    "SELECT id FROM surveys WHERE id = ? AND user_id = ?",
  )
    .bind(surveyId, user.id)
    .first();

  if (!survey) {
    return c.json(
      {
        error: "Survey not found",
      },
      404,
    );
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO questions
      (survey_id, question, type, options_json)
      VALUES (?, ?, ?, ?)`,
  )
    .bind(surveyId, question, type, JSON.stringify(options ?? []))
    .run();

  return c.json({
    success: true,
    id: result.meta.last_row_id,
  });
});

app.delete("/api/questions/:id", authMiddleware, async (c) => {
  const questionId = c.req.param("id");

  const user = c.get("user");

  const question = await c.env.DB.prepare(
    `
      SELECT q.id
      FROM questions q
      JOIN surveys s
      ON q.survey_id = s.id
      WHERE q.id = ?
      AND s.user_id = ?
      `,
  )
    .bind(questionId, user.id)
    .first();

  if (!question) {
    return c.json(
      {
        error: "Question not found",
      },
      404,
    );
  }

  await c.env.DB.prepare("DELETE FROM questions WHERE id = ?")
    .bind(questionId)
    .run();

  return c.json({
    success: true,
    message: "Question deleted",
  });
});

app.get("/api/surveys/:id/questions", authMiddleware, async (c) => {
  try {
    const surveyId = c.req.param("id");

    const user = c.get("user");

    const survey = await c.env.DB.prepare(
      `
        SELECT id
        FROM surveys
        WHERE id = ?
        AND user_id = ?
        `,
    )
      .bind(surveyId, user.id)
      .first();

    if (!survey) {
      return c.json(
        {
          error: "Survey not found",
        },
        404,
      );
    }

    const questions = await c.env.DB.prepare(
      `
        SELECT *
        FROM questions
        WHERE survey_id = ?
        ORDER BY id ASC
        `,
    )
      .bind(surveyId)
      .all();

    return c.json({
      success: true,
      questions: questions.results,
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        success: false,
        error: "Failed to fetch questions",
      },
      500,
    );
  }
});

app.get("/api/public/surveys/:id", async (c) => {
  try {
    const surveyId = c.req.param("id");

    const survey = await c.env.DB.prepare(
      `
        SELECT id, title, description
        FROM surveys
        WHERE id = ?
        `,
    )
      .bind(surveyId)
      .first();

    if (!survey) {
      return c.json({ error: "Survey not found" }, 404);
    }

    const questions = await c.env.DB.prepare(
      `
        SELECT *
        FROM questions
        WHERE survey_id = ?
        ORDER BY id ASC
        `,
    )
      .bind(surveyId)
      .all();

    return c.json({
      survey,
      questions: questions.results,
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        error: "Failed to fetch survey",
      },
      500,
    );
  }
});

//responser
app.post("/api/public/surveys/:id/responses", async (c) => {
  try {
    const surveyId = c.req.param("id");

    const body = await c.req.json();

    const { answers } = body;

    if (!answers) {
      return c.json({ error: "Answers are required" }, 400);
    }

    const survey = await c.env.DB.prepare("SELECT id FROM surveys WHERE id = ?")
      .bind(surveyId)
      .first();

    if (!survey) {
      return c.json({ error: "Survey not found" }, 404);
    }

    const result = await c.env.DB.prepare(
      `
        INSERT INTO responses
        (survey_id, answers_json)
        VALUES (?, ?)
        `,
    )
      .bind(surveyId, JSON.stringify(answers))
      .run();

    return c.json({
      success: true,
      id: result.meta.last_row_id,
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        success: false,
        error: "Failed to submit response",
      },
      500,
    );
  }
});

app.get("/api/surveys/:id/responses", authMiddleware, async (c) => {
  try {
    const surveyId = c.req.param("id");

    const user = c.get("user");

    const survey = await c.env.DB.prepare(
      `
        SELECT id
        FROM surveys
        WHERE id = ?
        AND user_id = ?
        `,
    )
      .bind(surveyId, user.id)
      .first();

    if (!survey) {
      return c.json({ error: "Survey not found" }, 404);
    }

    const responses = await c.env.DB.prepare(
      `
        SELECT *
        FROM responses
        WHERE survey_id = ?
        ORDER BY created_at DESC
        `,
    )
      .bind(surveyId)
      .all();

    const formattedResponses = responses.results.map((response: any) => ({
      ...response,
      answers: JSON.parse(response.answers_json),
    }));

    return c.json({
      success: true,
      responses: formattedResponses,
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        success: false,
        error: "Failed to fetch responses",
      },
      500,
    );
  }
});

export default app;
