import api from "./client";

export const startQuizAttempt = async (quizId) => {
  const { data } = await api.post(`/quizzes/${quizId}/attempts/start`);
  return data;
};

export const answerQuestion = async (attemptId, questionId, payload) => {
  const { data } = await api.post(`/quiz-attempts/${attemptId}/questions/${questionId}/answer`, payload);
  return data;
};

export const submitQuizAttempt = async (attemptId) => {
  const { data } = await api.post(`/quiz-attempts/${attemptId}/submit`);
  return data;
};
