import express from "express";
import {
	chat,
	generateResumeMatch,
	generateInterviewQuestions,
	generateReadinessPlan,
	generateOutreachDraft,
	generateRiskPrediction,
	parseJobDescription,
	reviewApplication,
	generateAnalyticsNarrative,
	knowledgeBaseAnswer
} from "../controllers/aiController.js";

const router = express.Router();

// This defines the endpoint: POST /api/ai/chat
router.post("/chat", chat);
router.post("/resume-match", generateResumeMatch);
router.post("/interview-questions", generateInterviewQuestions);
router.post("/readiness-plan", generateReadinessPlan);
router.post("/outreach-draft", generateOutreachDraft);
router.post("/risk-prediction", generateRiskPrediction);
router.post("/jd-parse", parseJobDescription);
router.post("/application-review", reviewApplication);
router.post("/analytics-narrative", generateAnalyticsNarrative);
router.post("/knowledge-base", knowledgeBaseAnswer);

export default router;