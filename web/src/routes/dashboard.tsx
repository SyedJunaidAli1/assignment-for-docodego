import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createSurvey, getMySurveys } from "../lib/api";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

type Survey = {
  id: number;
  title: string;
  description: string;
};

function DashboardPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const fetchSurveys = async () => {
    try {
      const data = await getMySurveys();

      setSurveys(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createSurvey(title, description);

      setTitle("");
      setDescription("");

      await fetchSurveys();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">My Surveys</h1>

      <form
        onSubmit={handleCreate}
        className="mb-8 flex flex-col gap-3 rounded border p-4"
      >
        <input
          type="text"
          placeholder="Survey Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded border p-2"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded border p-2"
        />

        <button type="submit" disabled={loading} className="rounded border p-2">
          {loading ? "Creating..." : "Create Survey"}
        </button>
      </form>

      <div className="space-y-3">
        {surveys.map((survey) => (
          <div key={survey.id} className="rounded border p-4">
            <h2 className="font-semibold">{survey.title}</h2>

            <p>{survey.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
