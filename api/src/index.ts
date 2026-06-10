import { Hono } from "hono";
import { hash } from "bcryptjs";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => c.json({ status: "ok" }));

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

app.post("/api/surveys", async (c) => {
  const body = await c.req.json();

  const { title, description } = body;
  if (!title) {
    return c.json({ error: "Title is required" });
  }
  try {
    const result = await c.env.DB.prepare(
      "INSERT INTO surveys (title, description) VALUES (?, ?)",
    )
      .bind(title, description)
      .run();

    return c.json({ success: true, id: result.meta.last_row_id });
  } catch {
    return c.json({ success: false, error: "failed to create surveys" }, 500);
  }
});

app.get("api/surveys", async (c) => {
  const result = await c.env.DB.prepare("SELECT * FROM surveys").all();

  return c.json(result.results);
});

app.get("api/surveys/:id", async (c) => {
  const id = c.req.param("id");
  const result = await c.env.DB.prepare("SELECT * FROM surveys WHERE id = ?")
    .bind(id)
    .first();

  if (!result) {
    return c.json({ error: "Survey not found" });
  }
  return c.json(result);
});

app.delete("api/surveys/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await c.env.DB.prepare("SELECT id FROM surveys WHERE id = ?")
      .bind(id)
      .first();

    if (!result) {
      return c.json({ error: "Survey not found" }, 404);
    }

    await c.env.DB.prepare("DELETE FROM surveys WHERE id = ?").bind(id).first();
    return c.json({ success: true, message: "Survey deleted" });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Falied to delete survey" }, 500);
  }
});

export default app;
