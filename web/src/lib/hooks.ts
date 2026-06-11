import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMySurveys,
  createSurvey,
  deleteSurvey,
  getQuestions,
  createQuestion,
  deleteQuestion,
  getPublicSurvey,
  submitResponse,
  getResponses,
  Survey,
  Question,
  SurveyResponse,
} from "./api";

// Query Keys definitions
export const surveyKeys = {
  all: ["surveys"] as const,
  detail: (id: number) => ["surveys", id] as const,
  questions: (surveyId: number) => ["surveys", surveyId, "questions"] as const,
  responses: (surveyId: number) => ["surveys", surveyId, "responses"] as const,
  publicDetail: (id: number) => ["public", "surveys", id] as const,
};

// 1. Dashboard hooks
export const useSurveys = () => {
  return useQuery<Survey[]>({
    queryKey: surveyKeys.all,
    queryFn: getMySurveys,
  });
};

export const useSurvey = (id: number) => {
  return useQuery<Survey>({
    queryKey: surveyKeys.detail(id),
    queryFn: () => getSurvey(id),
    enabled: !isNaN(id),
  });
};

export const useCreateSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, description }: { title: string; description: string }) =>
      createSurvey(title, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
    },
  });
};

export const useDeleteSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSurvey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
    },
  });
};

// 2. Survey Details hooks
export const useQuestions = (surveyId: number) => {
  return useQuery<Question[]>({
    queryKey: surveyKeys.questions(surveyId),
    queryFn: () => getQuestions(surveyId),
    enabled: !isNaN(surveyId),
  });
};

export const useCreateQuestion = (surveyId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (question: {
      text: string;
      type: "text" | "single-choice" | "multiple-choice";
      options?: string[];
    }) => createQuestion(surveyId, question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.questions(surveyId) });
    },
  });
};

export const useDeleteQuestion = (surveyId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.questions(surveyId) });
    },
  });
};

// 3. Public Survey hooks
export const usePublicSurvey = (surveyId: number) => {
  return useQuery<{ survey: Survey; questions: Question[] }>({
    queryKey: surveyKeys.publicDetail(surveyId),
    queryFn: () => getPublicSurvey(surveyId),
    enabled: !isNaN(surveyId),
  });
};

export const useSubmitResponse = (surveyId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (answers: Record<string, string>) => submitResponse(surveyId, answers),
    onSuccess: () => {
      // Invalidate responses in case the creator is looking at them
      queryClient.invalidateQueries({ queryKey: surveyKeys.responses(surveyId) });
    },
  });
};

// 4. Responses hooks
export const useResponses = (surveyId: number) => {
  return useQuery<SurveyResponse[]>({
    queryKey: surveyKeys.responses(surveyId),
    queryFn: () => getResponses(surveyId),
    enabled: !isNaN(surveyId),
  });
};
