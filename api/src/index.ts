import { Hono } from "hono";
import { hash } from "bcryptjs";
import { compare } from "bcryptjs";
import { generateToken } from "./utils/jwt";
import { authMiddleware } from "./middleware/auth";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => c.json({ status: "ok" }));

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

export default app;
