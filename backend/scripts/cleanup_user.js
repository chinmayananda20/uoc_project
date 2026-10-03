require('dotenv').config({ path: '../backend/.env' });
const mongoose = require('mongoose');
const User = require('../backend/models/User');
const Course = require('../backend/models/Course');
const Enrollment = require('../backend/models/Enrollment');
const QuizAttempt = require('../backend/models/QuizAttempt');
const LessonProgress = require('../backend/models/Lessonprogress');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'mandulachinmayananda@gmail.com';
    const courseTitle = /python/i; // Case-insensitive search for Python

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return;
    }
    console.log(`Found user: ${user._id} (${user.email})`);

    const course = await Course.findOne({ title: courseTitle });
    if (!course) {
      console.log('Course not found');
      return;
    }
    console.log(`Found course: ${course._id} (${course.title})`);

    // 1. Remove Enrollment
    const enrResult = await Enrollment.deleteMany({ userId: user._id, courseId: course._id });
    console.log(`Deleted ${enrResult.deletedCount} enrollment records`);

    // 2. Remove Quiz Attempts
    const quizResult = await QuizAttempt.deleteMany({ userId: user._id });
    console.log(`Deleted ${quizResult.deletedCount} quiz attempt records`);

    // 3. Remove Lesson Progress
    const lessonResult = await LessonProgress.deleteMany({ userId: user._id });
    console.log(`Deleted ${lessonResult.deletedCount} lesson progress records`);

    console.log('Cleanup complete');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
  }
}

cleanup();
