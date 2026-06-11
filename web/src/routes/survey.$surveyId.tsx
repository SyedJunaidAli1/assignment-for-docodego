import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { usePublicSurvey, useSubmitResponse } from "../lib/hooks";

export const Route = createFileRoute("/survey/$surveyId")({
  component: PublicSurveyPage,
});

function PublicSurveyPage() {
  const params = Route.useParams();
  const surveyId = parseInt(params.surveyId, 10);

  const { data, isLoading, error } = usePublicSurvey(surveyId);
  const submitMutation = useSubmitResponse(surveyId);

  // State to hold the responses. Key: question ID (string), Value: answer string
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // For multiple-choice inputs, keep selected options list separately for easier state handling
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleTextChange = (questionId: number, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: val,
    }));
  };

  const handleRadioChange = (questionId: number, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: option,
    }));
  };

  const handleCheckboxChange = (questionId: number, option: string, isChecked: boolean) => {
    const qKey = String(questionId);
    const currentSelections = multiSelectAnswers[qKey] || [];
    let nextSelections: string[];

    if (isChecked) {
      nextSelections = [...currentSelections, option];
    } else {
      nextSelections = currentSelections.filter((item) => item !== option);
    }

    setMultiSelectAnswers((prev) => ({
      ...prev,
      [qKey]: nextSelections,
    }));

    // Update main answers object as comma-separated string
    setAnswers((prev) => ({
      ...prev,
      [qKey]: nextSelections.join(", "),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitMutation.mutateAsync(answers);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-sm text-slate-500 font-medium">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-600">
          <h3 className="text-lg font-bold">Survey Unreachable</h3>
          <p className="mt-2 text-sm">This survey might not exist or is no longer accepting responses.</p>
        </div>
      </div>
    );
  }

  const { survey, questions: questionsData = [] } = data;
  const questions = Array.isArray(questionsData) ? questionsData : [];

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg
              className="h-6 w-6"
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
          </div>
          <h3 className="mt-4 text-xl font-bold text-slate-900">Thank You!</h3>
          <p className="mt-2 text-sm text-slate-500">
            Your response to <strong className="text-slate-800">{survey.title}</strong> has been successfully submitted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-800">
      <div className="mx-auto max-w-2xl">
        {/* Survey Banner / Intro */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-3xl font-black text-transparent">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="mt-3 text-slate-600 leading-relaxed">{survey.description}</p>
          )}
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {questions.map((question, qIdx) => {
            // Parse options
            let rawOptions = question.options_json || question.options;
            let parsedOptions: string[] = [];
            if (rawOptions) {
              if (Array.isArray(rawOptions)) {
                parsedOptions = rawOptions;
              } else {
                try {
                  parsedOptions = JSON.parse(rawOptions);
                } catch {
                  parsedOptions = String(rawOptions)
                    .split(",")
                    .map((s) => s.trim());
                }
              }
            }

            return (
              <div
                key={question.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                 <label className="block font-bold text-slate-900">
                  <span className="mr-2 text-indigo-600">{qIdx + 1}.</span>
                  {question.question}
                </label>

                {/* Render field inputs */}
                {question.type === "text" && (
                  <input
                    type="text"
                    required
                    placeholder="Your answer"
                    value={answers[String(question.id)] || ""}
                    onChange={(e) => handleTextChange(question.id, e.target.value)}
                    className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                )}

                {(question.type === "single_choice" || question.type === "single-choice") && (
                  <div className="mt-4 space-y-2.5">
                    {parsedOptions.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 cursor-pointer transition-colors hover:bg-slate-100/50"
                      >
                        <input
                          type="radio"
                          required
                          name={`q-${question.id}`}
                          checked={answers[String(question.id)] === opt}
                          onChange={() => handleRadioChange(question.id, opt)}
                          className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {(question.type === "multiple_choice" || question.type === "multiple-choice") && (
                  <div className="mt-4 space-y-2.5">
                    {parsedOptions.map((opt, oIdx) => {
                      const isChecked = (multiSelectAnswers[String(question.id)] || []).includes(opt);
                      return (
                        <label
                          key={oIdx}
                          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 cursor-pointer transition-colors hover:bg-slate-100/50"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleCheckboxChange(question.id, opt, e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="submit"
            disabled={submitMutation.isPending || questions.length === 0}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-base font-bold text-white shadow-md shadow-indigo-100 transition-all hover:opacity-95 active:scale-98 disabled:opacity-50"
          >
            {submitMutation.isPending ? "Submitting Response..." : "Submit Response"}
          </button>
        </form>
      </div>
    </div>
  );
}
