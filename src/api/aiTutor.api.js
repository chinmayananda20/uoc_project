import API from "./client";

/**
 * Sends a message to the AI Tutor.
 * @param {Object} payload { mode, message, courseId, lessonId, currentSlideIndex, quizAttemptId }
 */
export const askTutor = async (payload) => {
  const response = await API.post("/ai/tutor", payload);
  return response.data;
};
