import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuestions, useResponses, useSurvey } from '../lib/hooks'

export const Route = createFileRoute('/surveys/$surveyId/responses')({
  component: ResponsesPage,
})

function ResponsesPage() {
  const params = Route.useParams()
  const surveyId = parseInt(params.surveyId, 10)

  const { data: survey, isLoading: loadingSurvey } = useSurvey(surveyId)
  const { data: questionsData = [], isLoading: loadingQuestions } = useQuestions(surveyId)
  const { data: responsesData = [], isLoading: loadingResponses } = useResponses(surveyId)

  const questions = Array.isArray(questionsData) ? questionsData : []
  const responses = Array.isArray(responsesData) ? responsesData : []

  const isLoading = loadingSurvey || loadingQuestions || loadingResponses

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-sm text-slate-500 font-medium">Loading survey responses...</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-600">
          <h3 className="text-lg font-bold">Survey Not Found</h3>
          <p className="mt-2 text-sm">We couldn't retrieve responses for this survey.</p>
          <Link
            to="/dashboard"
            className="mt-4 inline-block rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
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
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 line-clamp-1">{survey.title}</h1>
              <p className="text-xs text-slate-500">View Responses</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/surveys/$surveyId"
              params={{ surveyId: String(survey.id) }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Manage Questions
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900 font-display">Submissions</h2>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            {responses.length} {responses.length === 1 ? 'response' : 'responses'}
          </span>
        </div>

        {responses.length === 0 ? (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No responses yet</h3>
            <p className="mt-1 text-xs text-slate-500">
              Share the public link of the survey to start receiving answers.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {responses.map((resp, rIdx) => {
              // Parse answers_json.
              let answersObj: Record<string, string> = {}
              if (resp.answers && typeof resp.answers === 'object') {
                answersObj = resp.answers
              } else if (resp.answers_json) {
                try {
                  if (typeof resp.answers_json === 'string') {
                    answersObj = JSON.parse(resp.answers_json)
                  } else {
                    answersObj = resp.answers_json
                  }
                } catch (err) {
                  console.error('Failed to parse response answers_json:', err)
                }
              }

              // Extract answers nested under 'answers' if that format is used
              if (answersObj && (answersObj as any).answers) {
                answersObj = (answersObj as any).answers
              }

              const rawDate = resp.created_at || resp.createdAt
              const submittedDate = rawDate ? new Date(rawDate).toLocaleString() : 'Unknown date'

              return (
                <div
                  key={resp.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <span className="text-sm font-bold text-indigo-600">
                      Response #{responses.length - rIdx}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Submitted: {submittedDate}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {questions.map((question, qIdx) => {
                      const answer = answersObj[String(question.id)]
                      return (
                        <div key={question.id} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div className="md:col-span-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Question {qIdx + 1}
                            </span>
                            <p className="text-sm font-bold text-slate-800">{question.question}</p>
                          </div>
                          <div className="md:col-span-2 rounded-xl bg-slate-50/50 border border-slate-100 px-4 py-3">
                            {answer ? (
                              <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">
                                {answer}
                              </p>
                            ) : (
                              <p className="text-sm italic text-slate-400">No answer provided</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
