import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { signup } from "../lib/api";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await signup(
        email,
        password,
      );

      navigate({
        to: "/signin",
      });
    } catch {
      setError(
        "Failed to create account",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4 rounded border p-6"
      >
        <h1 className="text-2xl font-bold">
          Sign Up
        </h1>

        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="rounded border p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="rounded border p-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded border p-2"
        >
          {loading
            ? "Creating..."
            : "Sign Up"}
        </button>
      </form>
    </div>
  );
}