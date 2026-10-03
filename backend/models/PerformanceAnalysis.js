const mongoose = require('mongoose');

const PerformanceAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  quizAttemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt', required: true },
  scorePercent: { type: Number, required: true },
  weakTopics: [{ type: String }],
  learningState: { type: String, enum: ['very_weak', 'moderate', 'strong'], required: true },
  ruleBasedAction: { type: String, required: true },
  mlPredictedMastery: { type: String },
  mlRiskLevel: { type: String },
  mlRecommendedAction: { type: String },
  mlConfidence: { type: Number },
  source: { type: String, enum: ['ml', 'rule_based_fallback'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('PerformanceAnalysis', PerformanceAnalysisSchema);
