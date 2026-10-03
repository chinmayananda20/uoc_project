const express = require("express");
const router = express.Router();
const fetchUser = require("../middlewares/auth");
const practiceController = require("../controllers/practiceController");

// POST /api/practice/generate/:attemptId
router.post("/generate/:attemptId", fetchUser, practiceController.generatePracticeSet);

// GET /api/practice/:practiceSetId
router.get("/:practiceSetId", fetchUser, practiceController.getPracticeSet);

// POST /api/practice/:practiceSetId/submit
router.post("/:practiceSetId/submit", fetchUser, practiceController.submitPracticeSet);

module.exports = router;
