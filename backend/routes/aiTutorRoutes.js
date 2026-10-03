const express = require("express");
const router = express.Router();
const fetchUser = require("../middlewares/auth");
const aiTutorController = require("../controllers/aiTutorController");

// POST /api/ai/tutor
router.post("/tutor", fetchUser, aiTutorController.askTutor);

module.exports = router;
