const express = require("express");

const {
    generateQuizQuestions,
    convertPoints,
    getUserQuizInfo,
} = require("../controllers/quizController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/questions", protect, generateQuizQuestions);

router.put("/convert-points", protect, convertPoints);

router.get("/get-points", protect, getUserQuizInfo);

module.exports = router;