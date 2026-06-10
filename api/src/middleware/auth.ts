import { createMiddleware } from "hono/factory";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: {
    user: {
      id: number;
      email: string;
    };
  };
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token, c.env.JWT_SECRET);

    c.set("user", payload);

    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
});
