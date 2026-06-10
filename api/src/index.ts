import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.post("/api/surveys", async (c) => {
  return c.json({ message: "working" });
});

export default app;
