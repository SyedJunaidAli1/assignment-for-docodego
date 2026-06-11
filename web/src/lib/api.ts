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
