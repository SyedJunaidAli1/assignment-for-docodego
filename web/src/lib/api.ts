import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const signup = async (email: string, password: string) => {
  const res = await api.post('/api/auth/signup', {
    email,
    password,
  })

  return res.data
}

export const signin = async (email: string, password: string) => {
  const res = await api.post('/api/auth/signin', {
    email,
    password,
  })

  return res.data
}

export const getMySurveys = async () => {
  const res = await api.get('/api/surveys')
  if (res.data && Array.isArray(res.data)) {
    return res.data
  }
  if (res.data && typeof res.data === 'object') {
    if ('surveys' in res.data && Array.isArray(res.data.surveys)) {
      return res.data.surveys
    }
    if ('data' in res.data && Array.isArray(res.data.data)) {
      return res.data.data
    }
  }
  return []
}

export const createSurvey = async (title: string, description: string) => {
  const res = await api.post('/api/surveys', {
    title,
    description,
  })

  return res.data
}

export interface Survey {
  id: number
  title: string
  description: string
}

export interface Question {
  id: number
  surveyId?: number
  survey_id?: number
  question: string
  type: 'text' | 'single_choice' | 'multiple_choice' | 'single-choice' | 'multiple-choice'
  options: string[] | string | null
  options_json?: string | null
}

export interface SurveyResponse {
  id: number
  surveyId?: number
  survey_id?: number
  answers_json: string | Record<string, string>
  createdAt?: string
  created_at?: string
  answers?: Record<string, string>
}

export const getSurvey = async (id: number): Promise<Survey> => {
  const res = await api.get(`/api/surveys/${id}`)
  if (res.data && typeof res.data === 'object' && 'data' in res.data) {
    return res.data.data
  }
  return res.data
}

export const deleteSurvey = async (id: number) => {
  const res = await api.delete(`/api/surveys/${id}`)
  return res.data
}

export const getQuestions = async (surveyId: number): Promise<Question[]> => {
  const res = await api.get(`/api/surveys/${surveyId}/questions`)
  if (res.data && Array.isArray(res.data)) {
    return res.data
  }
  if (res.data && typeof res.data === 'object') {
    if ('questions' in res.data && Array.isArray(res.data.questions)) {
      return res.data.questions
    }
    if ('data' in res.data && Array.isArray(res.data.data)) {
      return res.data.data
    }
  }
  return []
}

export const createQuestion = async (
  surveyId: number,
  question: {
    question: string
    type: 'text' | 'single_choice' | 'multiple_choice'
    options?: string[]
  },
): Promise<Question> => {
  const res = await api.post(`/api/surveys/${surveyId}/questions`, question)

  if (res.data && typeof res.data === 'object' && 'data' in res.data) {
    return res.data.data
  }
  return res.data
}

export const deleteQuestion = async (id: number) => {
  const res = await api.delete(`/api/questions/${id}`)
  return res.data
}

export const getPublicSurvey = async (
  id: number,
): Promise<{ survey: Survey; questions: Question[] }> => {
  const res = await api.get(`/api/public/surveys/${id}`)
  if (res.data && typeof res.data === 'object' && 'data' in res.data) {
    return res.data.data
  }
  return res.data
}

export const submitResponse = async (id: number, answers: Record<string, string>) => {
  const res = await api.post(`/api/public/surveys/${id}/responses`, {
    answers,
  })
  return res.data
}

export const getResponses = async (surveyId: number): Promise<SurveyResponse[]> => {
  const res = await api.get(`/api/surveys/${surveyId}/responses`)
  if (res.data && Array.isArray(res.data)) {
    return res.data
  }
  if (res.data && typeof res.data === 'object') {
    if ('responses' in res.data && Array.isArray(res.data.responses)) {
      return res.data.responses
    }
    if ('data' in res.data && Array.isArray(res.data.data)) {
      return res.data.data
    }
  }
  return []
}
