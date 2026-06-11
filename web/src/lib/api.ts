import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const signup = async (email: string, password: string) => {
  const res = await api.post("/api/auth/signup", {
    email,
    password,
  });

  return res.data;
};

export const signin = async (email: string, password: string) => {
  const res = await api.post("/api/auth/signin", {
    email,
    password,
  });

  return res.data;
};

export const getMySurveys = async () => {
  const res = await api.get("/api/surveys");

  return res.data;
};

export const createSurvey = async (title: string, description: string) => {
  const res = await api.post("/api/surveys", {
    title,
    description,
  });

  return res.data;
};

export interface Survey {
  id: number;
  title: string;
  description: string;
}

export interface Question {
  id: number;
  surveyId: number;
  text: string;
  type: "text" | "single-choice" | "multiple-choice";
  options: string[] | string | null;
}

export interface SurveyResponse {
  id: number;
  surveyId: number;
  answers_json: string;
  createdAt?: string;
}

export const getSurvey = async (id: number): Promise<Survey> => {
  const res = await api.get(`/api/surveys/${id}`);
  return res.data;
};

export const deleteSurvey = async (id: number) => {
  const res = await api.delete(`/api/surveys/${id}`);
  return res.data;
};

export const getQuestions = async (surveyId: number): Promise<Question[]> => {
  const res = await api.get(`/api/surveys/${surveyId}/questions`);
  return res.data;
};

export const createQuestion = async (
  surveyId: number,
  question: { text: string; type: "text" | "single-choice" | "multiple-choice"; options?: string[] }
): Promise<Question> => {
  const res = await api.post(`/api/surveys/${surveyId}/questions`, question);
  return res.data;
};

export const deleteQuestion = async (id: number) => {
  const res = await api.delete(`/api/questions/${id}`);
  return res.data;
};

export const getPublicSurvey = async (
  id: number
): Promise<{ survey: Survey; questions: Question[] }> => {
  const res = await api.get(`/api/public/surveys/${id}`);
  return res.data;
};

export const submitResponse = async (
  id: number,
  answers: Record<string, string>
) => {
  const res = await api.post(`/api/public/surveys/${id}/responses`, { answers });
  return res.data;
};

export const getResponses = async (surveyId: number): Promise<SurveyResponse[]> => {
  const res = await api.get(`/api/surveys/${surveyId}/responses`);
  return res.data;
};

