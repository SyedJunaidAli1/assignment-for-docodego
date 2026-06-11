import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSurveys, useCreateSurvey, useDeleteSurvey } from "../lib/hooks";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: surveys = [], isLoading, error } = useSurveys();
  const createMutation = useCreateSurvey();
  const deleteMutation = useDeleteSurvey();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createMutation.mutateAsync({ title, description });
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this survey?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCopyLink = (id: number) => {
    const publicUrl = `${window.location.origin}/survey/${id}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/signin";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-2xl font-extrabold text-transparent">
            SurveyCraft
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500">Dashboard</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Create Survey Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Create New Survey</h2>
              <p className="mt-1 text-sm text-slate-500">
                Design a survey to collect responses.
              </p>

              <form onSubmit={handleCreate} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Survey Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Developer Feedback"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Description
                  </label>
                  <textarea
                    placeholder="What is this survey about?"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition-all hover:opacity-95 active:scale-98 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Create Survey"}
                </button>
              </form>
            </div>
          </div>

          {/* Survey List */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Your Surveys</h3>
              <span className="rounded-full bg-slate-200/60 px-3 py-1 text-xs font-semibold text-slate-600">
                {surveys.length} {surveys.length === 1 ? "survey" : "surveys"}
              </span>
            </div>

            {isLoading && (
              <div className="mt-8 flex flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                <p className="mt-4 text-sm text-slate-500">Loading your surveys...</p>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                Failed to load surveys. Please try reloading the page.
              </div>
            )}

            {!isLoading && surveys.length === 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">No surveys found</h3>
                <p className="mt-1 text-xs text-slate-500">Get started by creating a new survey.</p>
              </div>
            )}

            <div className="mt-6 space-y-4">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {survey.title}
                      </h4>
                      <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">
                        {survey.description || "No description provided."}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(survey.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete survey"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-3">
                      <Link
                        to="/surveys/$surveyId"
                        params={{ surveyId: String(survey.id) }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
                      >
                        Manage Questions
                      </Link>
                      <Link
                        to="/surveys/$surveyId/responses"
                        params={{ surveyId: String(survey.id) }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-100"
                      >
                        View Responses
                      </Link>
                    </div>

                    <button
                      onClick={() => handleCopyLink(survey.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all ${
                        copiedId === survey.id
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {copiedId === survey.id ? (
                        <>
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Copied link!
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.684 10.742l-2.784 1.547a3 3 0 100 2.422l2.784 1.547m0-5.516a3 3 0 100-2.422l-2.784-1.547m0 5.516l2.784 1.547m0-5.516l1.817 1.009A3 3 0 1111.006 14l-1.817-1.009"
                            />
                          </svg>
                          Share Public Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
