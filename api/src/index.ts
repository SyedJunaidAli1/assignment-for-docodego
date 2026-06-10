import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => c.json({ status: "ok" }));

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

export default app;
