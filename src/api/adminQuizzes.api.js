import api from "./client";

// Quizzes
export const adminCreateQuizForLesson = async (lessonId, payload) => {
  const { data } = await api.post(`/lessons/${lessonId}/quiz`, payload);
  return data;
};

export const getQuizByLessonId = async (lessonId) => {
  const { data } = await api.get(`/lessons/${lessonId}/quiz`);
  return data;
};

export const adminUpdateQuiz = async (quizId, payload) => {
  const { data } = await api.patch(`/quizzes/${quizId}`, payload);
  return data;
};

// Questions
export const adminCreateQuestion = async (quizId, payload) => {
  const { data } = await api.post(`/quizzes/${quizId}/questions`, payload);
  return data;
};

export const getQuestionsByQuiz = async (quizId) => {
  const { data } = await api.get(`/quizzes/${quizId}/questions`);
  return data;
};

export const adminUpdateQuestion = async (questionId, payload) => {
  const { data } = await api.patch(`/questions/${questionId}`, payload);
  return data;
};

export const adminDeleteQuestion = async (questionId) => {
  const { data } = await api.delete(`/questions/${questionId}`);
  return data;
};
