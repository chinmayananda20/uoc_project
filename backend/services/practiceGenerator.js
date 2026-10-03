/**
 * This is rule-based rewriting, not AI-generated question creation.
 * We prepend context-aware prefixes to original questions to differentiate
 * them from the quiz while maintaining their logical integrity.
 */

/**
 * Determines practice type based on mastery level.
 */
function decidePracticeType(masteryLevel) {
  if (masteryLevel === "low") return "remedial";
  if (masteryLevel === "medium") return "reinforcement";
  return "challenge";
}

/**
 * Helper to build options for a practice question.
 */
function buildPracticeOptions(q) {
  if (q.options && q.options.length > 0) {
    return q.options;
  }
  // Fallback for true/false questions
  if (typeof q.correctAnswer === "boolean" || 
      (typeof q.correctAnswer === "string" && ["true", "false"].includes(q.correctAnswer.toLowerCase()))) {
    return [
      { key: "true", text: "True" },
      { key: "false", text: "False" }
    ];
  }
  return [];
}

/**
 * Helper to get a human-readable topic label.
 */
function getTopicLabel(q) {
  return q.subtopic || q.topicTag || q.topic || "this concept";
}

/**
 * Rewrites the question text safely to preserve meaning.
 */
function rewritePracticeQuestion(q, practiceType) {
  const topic = getTopicLabel(q);
  const prompt = q.prompt || "";
  
  if (practiceType === "remedial") {
    return `Practice review on ${topic}: ${prompt}`;
  }

  if (practiceType === "reinforcement") {
    return `Check your understanding of ${topic}: ${prompt}`;
  }

  if (practiceType === "challenge") {
    return `Advanced review of ${topic}: ${prompt}`;
  }

  return `Practice: ${prompt}`;
}

/**
 * Generates practice questions from existing source questions.
 */
function generatePracticeQuestions({ weakTopics, masteryLevel, sourceQuestions }) {
  // Filter questions by weak topics if available
  let pool = sourceQuestions;
  if (weakTopics && weakTopics.length > 0) {
    const topicFiltered = sourceQuestions.filter(q => weakTopics.includes(q.topicTag));
    if (topicFiltered.length > 0) pool = topicFiltered;
  }

  // Determine target difficulty
  let targetDifficulty = "medium";
  if (masteryLevel === "low") targetDifficulty = "easy";
  if (masteryLevel === "high") targetDifficulty = "hard";

  const practiceType = decidePracticeType(masteryLevel);

  // Try to find questions matching difficulty, fallback to any if not enough
  let candidatePool = pool.filter(q => q.difficultyLevel === targetDifficulty);
  if (candidatePool.length < 3) candidatePool = pool;

  // Shuffle and pick 3-5
  const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(5, Math.max(3, shuffled.length)));

  return selected.map(q => ({
    questionText: rewritePracticeQuestion(q, practiceType),
    options: buildPracticeOptions(q),
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    topicTag: q.topicTag,
    difficultyLevel: q.difficultyLevel,
    sourceQuestionId: q._id
  }));
}

module.exports = {
  decidePracticeType,
  generatePracticeQuestions,
  /**
   * Placeholder for future LLM-based practice generation.
   * To be fully implemented in the next phase.
   */
  generatePracticeQuestionsWithLLM: async (data) => {
    console.log("LLM Practice Generation placeholder called.");
    return null;
  }
};
