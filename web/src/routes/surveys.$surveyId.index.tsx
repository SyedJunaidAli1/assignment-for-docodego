import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  useSurvey,
  useQuestions,
  useCreateQuestion,
  useDeleteQuestion,
} from "../lib/hooks";

export const Route = createFileRoute("/surveys/$surveyId/")({
  component: SurveyDetailsPage,
});

function SurveyDetailsPage() {
  const params = Route.useParams();
  const surveyId = parseInt(params.surveyId, 10);

  const { data: survey, isLoading: loadingSurvey, error: surveyError } = useSurvey(surveyId);
  const { data: questionsData = [], isLoading: loadingQuestions } = useQuestions(surveyId);
  const questions = Array.isArray(questionsData) ? questionsData : [];

  const createMutation = useCreateQuestion(surveyId);
  const deleteMutation = useDeleteQuestion(surveyId);

  const [text, setText] = useState("");
  const [type, setType] = useState<"text" | "single_choice" | "multiple_choice">("text");
  const [options, setOptions] = useState<string[]>(["", ""]);

  const handleAddOptionField = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOptionField = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, val: string) => {
    const next = [...options];
    next[index] = val;
    setOptions(next);
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Filter out empty options for choice questions
    const finalOptions =
      type !== "text" ? options.map((o) => o.trim()).filter((o) => o !== "") : undefined;

    try {
      await createMutation.mutateAsync({
        question: text,
        type,
        options: finalOptions,
      });
      setText("");
      setType("text");
      setOptions(["", ""]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loadingSurvey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-sm text-slate-500 font-medium">Loading survey details...</p>
        </div>
      </div>
    );
  }

  if (surveyError || !survey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-600">
          <h3 className="text-lg font-bold">Error Loading Survey</h3>
          <p className="mt-2 text-sm">We couldn't find the survey you're looking for.</p>
          <Link
            to="/dashboard"
            className="mt-4 inline-block rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 line-clamp-1">
                {survey.title}
              </h1>
              <p className="text-xs text-slate-500">Manage questions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/surveys/$surveyId/responses"
              params={{ surveyId: String(survey.id) }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              View Responses
            </Link>
            <a
              href={`/survey/${survey.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              View Public Form
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Add Question Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 font-display">Add Question</h2>
              <p className="mt-1 text-sm text-slate-500">Insert a new field into the survey.</p>

              <form onSubmit={handleCreateQuestion} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Question Text
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. What is your favorite color?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Question Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="text">Text Input</option>
                    <option value="single_choice">Single Choice (Radio)</option>
                    <option value="multiple_choice">Multiple Choice (Checkboxes)</option>
                  </select>
                </div>

                {type !== "text" && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Options
                      </label>
                      <button
                        type="button"
                        onClick={handleAddOptionField}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        + Add Choice
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            required
                            placeholder={`Choice ${idx + 1}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none transition-all focus:border-indigo-500 focus:bg-white"
                          />
                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionField(idx)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition-all hover:opacity-95 active:scale-98 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Adding..." : "Add Question"}
                </button>
              </form>
            </div>
          </div>

          {/* Questions List */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-xl font-bold text-slate-900">Questions List</h3>
              <span className="rounded-full bg-slate-200/60 px-3 py-1 text-xs font-semibold text-slate-600">
                {questions.length} {questions.length === 1 ? "question" : "questions"}
              </span>
            </div>

            {loadingQuestions && (
              <div className="mt-8 flex flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                <p className="mt-4 text-sm text-slate-500">Loading questions...</p>
              </div>
            )}

            {!loadingQuestions && questions.length === 0 && (
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
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">No questions yet</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Add questions on the left sidebar to build your survey form.
                </p>
              </div>
            )}

            <div className="mt-6 space-y-4">
              {questions.map((question, index) => {
                // Parse options if stored as JSON string
                let rawOptions = question.options_json || question.options;
                let parsedOptions: string[] = [];
                if (rawOptions) {
                  if (Array.isArray(rawOptions)) {
                    parsedOptions = rawOptions;
                  } else if (typeof rawOptions === "string") {
                    try {
                      let parsed = JSON.parse(rawOptions);
                      if (typeof parsed === "string") {
                        parsed = JSON.parse(parsed);
                      }
                      if (Array.isArray(parsed)) {
                        parsedOptions = parsed;
                      }
                    } catch {
                      parsedOptions = rawOptions
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                    }
                  }
                }

                return (
                  <div
                    key={question.id}
                    className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-600">
                          {index + 1}
                        </span>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-3xs font-semibold uppercase tracking-wider text-indigo-600">
                          {question.type === "text"
                            ? "Text"
                            : (question.type === "single_choice" || question.type === "single-choice")
                              ? "Single Choice"
                              : "Multiple Choice"}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{question.question}</h4>
                      {parsedOptions.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {parsedOptions.map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete question"
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
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
