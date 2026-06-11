import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/signin")({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl font-bold">Sign In</h1>
    </div>
  );
}
