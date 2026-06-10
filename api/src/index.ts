import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.post("/api/surveys", async (c) => {
  await c.env.DB.prepare(
    "INSERT INTO surveys (title, description) VALUES (?, ?)",
  )
    .bind("sdasdasda", "description")
    .run();

  return c.json({ success: true})
});

app.get("api/surveys", async (c) => {
  const result = await c.env.DB.prepare("SELECT * FROM surveys").all();

  return c.json(result.results);
});

export default app;
