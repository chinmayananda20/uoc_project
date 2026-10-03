import API from "./client";

export const generatePracticeSet = async (attemptId, regenerate = false) => {
  const url = `/practice/generate/${attemptId}${regenerate ? "?regenerate=true" : ""}`;
  const response = await API.post(url);
  return response.data;
};

export const getPracticeSet = async (practiceSetId) => {
  const response = await API.get(`/practice/${practiceSetId}`);
  return response.data;
};

export const submitPracticeSet = async (practiceSetId, answers) => {
  const response = await API.post(`/practice/${practiceSetId}/submit`, { answers });
  return response.data;
};
