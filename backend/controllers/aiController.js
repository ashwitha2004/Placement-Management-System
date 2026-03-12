import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const getApiKey = () => process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const CHAT_MODEL_CANDIDATES = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-flash-latest",
  "gemini-pro"
];

const askGemini = async (prompt) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || "";
    return text.trim() || null;
  } catch (error) {
    console.error("Gemini generateContent error:", error?.message || error);
    return null;
  }
};

const numberValue = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

const normalizeHistoryForGemini = (history) => {
  const normalized = safeArray(history)
    .filter((item) => item && (item.message || item.text))
    .map((item) => ({
      role: item.role === "user" ? "user" : "model",
      parts: [{ text: String(item.message || item.text) }]
    }));

  while (normalized.length && normalized[0].role !== "user") {
    normalized.shift();
  }

  return normalized;
};

const runGeminiChat = async (genAI, modelName, message, history) => {
  const model = genAI.getGenerativeModel({ model: modelName });
  const chatSession = model.startChat({ history });
  const result = await chatSession.sendMessage(message);
  const text = result?.response?.text?.() || "";
  return text.trim();
};

const buildPromptFromHistory = (history, message) => {
  const recent = safeArray(history).slice(-8).map((entry) => {
    const role = entry?.role === "user" ? "User" : "Assistant";
    const content = String(entry?.message || entry?.text || "").trim();
    return content ? `${role}: ${content}` : "";
  }).filter(Boolean);

  return [
    "You are a concise placement assistant for students and staff.",
    ...recent,
    `User: ${String(message || "").trim()}`,
    "Assistant:"
  ].join("\n");
};

export const chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        reply: "Please provide a message"
      });
    }
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ 
        success: true, 
        reply: "Hello! I'm an AI assistant for the GenAI Placement System. I can help you with information about jobs, applications, interviews, and campus placement processes. What would you like to know?",
        provider: "fallback" 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const normalizedHistory = normalizeHistoryForGemini(history);

    for (const modelName of CHAT_MODEL_CANDIDATES) {
      try {
        const reply = await runGeminiChat(genAI, modelName, message, normalizedHistory);
        if (reply) {
          return res.json({ success: true, reply, provider: modelName });
        }
      } catch (modelError) {
        console.error(`Gemini chat error [${modelName}]:`, modelError?.message || modelError);
      }
    }

    // Final fallback: plain generateContent with compact prompt built from history.
    const compactPrompt = buildPromptFromHistory(history, message);
    const fallbackText = await askGemini(compactPrompt);

    if (fallbackText) {
      return res.json({ success: true, reply: fallbackText, provider: "generateContent-fallback" });
    }

    return res.status(200).json({
      success: true,
      reply: "I could not reach Gemini right now. Please retry in a few seconds.",
      provider: "fallback"
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(200).json({
      success: true,
      reply: "I could not process that request right now. Please try again.",
      provider: "fallback"
    });
  }
};

export const generateResumeMatch = async (req, res) => {
  try {
    const { candidate = {}, job = {} } = req.body || {};
    const candidateSkills = safeArray(candidate.skills).map((skill) => String(skill || "").toLowerCase()).filter(Boolean);
    const jobSkills = safeArray(job.skills).map((skill) => String(skill || "").toLowerCase()).filter(Boolean);

    const matchedSkills = jobSkills.filter((skill) => candidateSkills.includes(skill));
    const missingSkills = jobSkills.filter((skill) => !candidateSkills.includes(skill));

    const cgpa = numberValue(candidate.cgpa, 0);
    const attendance = numberValue(candidate.attendance, 0);
    const profileBoost = Math.min(20, Math.round((cgpa / 10) * 15 + (attendance / 100) * 5));
    const skillScore = jobSkills.length ? Math.round((matchedSkills.length / jobSkills.length) * 80) : 40;
    const matchScore = Math.max(0, Math.min(100, skillScore + profileBoost));

    const improvementPlan = [
      missingSkills[0] ? `Day 1-2: Learn ${missingSkills[0]} basics and complete 1 mini task.` : "Day 1-2: Refine strongest project bullet points.",
      missingSkills[1] ? `Day 3-4: Build a small proof-of-concept using ${missingSkills[1]}.` : "Day 3-4: Practice aptitude + communication drills.",
      "Day 5: Add measurable impact lines in resume (numbers, outcomes).",
      "Day 6: Solve 3 role-specific interview questions with STAR format.",
      "Day 7: Mock interview and final resume polish."
    ];

    return res.status(200).json({
      success: true,
      feature: "resume-match",
      result: {
        candidateName: candidate.name || "Candidate",
        role: job.title || "Target Role",
        matchScore,
        matchedSkills,
        missingSkills,
        explanation: `Matched ${matchedSkills.length}/${jobSkills.length || 1} required skills. Profile boost considered CGPA/attendance.`,
        improvementPlan
      }
    });
  } catch (error) {
    console.error("generateResumeMatch error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate resume match" });
  }
};

export const generateInterviewQuestions = async (req, res) => {
  try {
    const { roleTitle = "Software Engineer", company = "Campus Recruiter", skillFocus = [] } = req.body || {};
    const focus = safeArray(skillFocus).slice(0, 3);
    const prompt = [
      `Create 8 interview questions for role ${roleTitle} at ${company}.`,
      `Include 5 technical + 3 HR questions with expected key points and score rubric out of 10.`,
      `Skill focus: ${focus.join(", ") || "general aptitude"}.`,
      "Return as concise bullet points."
    ].join("\n");

    const geminiText = await askGemini(prompt);
    const fallbackQuestions = [
      `Technical: How would you design a reliable ${roleTitle} workflow? (Rubric: architecture clarity, trade-offs, scalability)`,
      "Technical: Explain a production bug you fixed and your debugging strategy.",
      `Technical: Implement a feature using ${focus[0] || "core data structures"}. What edge cases do you handle?`,
      `Technical: How do you ensure performance and observability in ${company} systems?`,
      `Technical: What testing strategy would you apply for ${roleTitle} deliverables?`,
      "HR: Describe a conflict in a team and how you resolved it.",
      "HR: Why this role and how does it match your long-term goals?",
      "HR: Describe a time you learned quickly under deadline pressure."
    ];

    return res.status(200).json({
      success: true,
      feature: "interview-questions",
      result: {
        roleTitle,
        company,
        content: geminiText || fallbackQuestions.join("\n")
      }
    });
  } catch (error) {
    console.error("generateInterviewQuestions error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate interview questions" });
  }
};

export const generateReadinessPlan = async (req, res) => {
  try {
    const { student = {} } = req.body || {};
    const cgpa = numberValue(student.cgpa, 7);
    const aptitude = numberValue(student.aptitudeScore, 60);
    const communication = numberValue(student.communicationScore, 60);
    const coding = numberValue(student.codingScore, 60);
    const readinessScore = Math.max(0, Math.min(100, Math.round((cgpa / 10) * 30 + aptitude * 0.25 + communication * 0.2 + coding * 0.25)));

    const focusArea = [
      aptitude < 65 ? "Aptitude" : null,
      communication < 65 ? "Communication" : null,
      coding < 65 ? "Coding" : null
    ].filter(Boolean);

    return res.status(200).json({
      success: true,
      feature: "readiness-plan",
      result: {
        readinessScore,
        focusArea: focusArea.length ? focusArea : ["Interview consistency"],
        plan: [
          "Complete 20 aptitude questions daily with timer.",
          "Record 2-minute self-introduction and improve clarity.",
          "Solve one medium coding problem and explain approach aloud.",
          "Update resume bullets with quantifiable impact.",
          "Attend one mock interview this week and close top feedback gaps."
        ]
      }
    });
  } catch (error) {
    console.error("generateReadinessPlan error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate readiness plan" });
  }
};

export const generateOutreachDraft = async (req, res) => {
  try {
    const { tone = "formal", channel = "email", context = "Interview reminder" } = req.body || {};
    const prompt = `Draft a ${tone} ${channel} message for: ${context}. Keep it under 140 words and include action + deadline.`;
    const geminiText = await askGemini(prompt);
    const fallback = `Subject: Placement Update\n\nHello Candidate,\n\nThis is a ${tone} reminder regarding ${context}. Please complete pending actions before the deadline and confirm your availability on the portal.\n\nBest regards,\nPlacement Team`;

    return res.status(200).json({
      success: true,
      feature: "outreach-draft",
      result: {
        channel,
        tone,
        draft: geminiText || fallback
      }
    });
  } catch (error) {
    console.error("generateOutreachDraft error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate outreach draft" });
  }
};

export const generateRiskPrediction = async (req, res) => {
  try {
    const { student = {} } = req.body || {};
    const cgpa = numberValue(student.cgpa, 0);
    const attendance = numberValue(student.attendance, 0);
    const backlogs = numberValue(student.backlogs, 0);
    const mockScore = numberValue(student.mockInterviewScore, 60);

    const riskScore = Math.max(0, Math.min(100, Math.round((8 - cgpa) * 12 + (90 - attendance) * 0.7 + backlogs * 14 + (70 - mockScore) * 0.4)));
    const severity = riskScore >= 60 ? "High" : riskScore >= 35 ? "Medium" : "Low";

    const reasons = [];
    if (cgpa < 7.5) reasons.push("Low CGPA against recent placement trends");
    if (attendance < 85) reasons.push("Attendance below expected threshold");
    if (backlogs > 0) reasons.push("Backlogs impacting shortlist eligibility");
    if (mockScore < 65) reasons.push("Mock interview performance needs improvement");

    return res.status(200).json({
      success: true,
      feature: "risk-prediction",
      result: {
        riskScore,
        severity,
        reasons: reasons.length ? reasons : ["Maintain current pace and consistency"],
        recommendations: [
          "Assign mentor and track weekly action items.",
          "Run focused mock interview sessions.",
          "Prioritize high-impact skill gaps for target roles."
        ]
      }
    });
  } catch (error) {
    console.error("generateRiskPrediction error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate risk prediction" });
  }
};

export const parseJobDescription = async (req, res) => {
  try {
    const { jobDescription = "" } = req.body || {};
    const text = String(jobDescription || "");
    if (!text.trim()) {
      return res.status(400).json({ success: false, message: "jobDescription is required" });
    }

    const extractedSkills = ["javascript", "react", "node", "python", "sql", "aws", "docker"]
      .filter((skill) => text.toLowerCase().includes(skill));

    const cgpaMatch = text.match(/cgpa\s*[:>=-]*\s*(\d+(?:\.\d+)?)/i);
    const roundsMatch = text.match(/(\d+)\s*(?:round|stages?)/i);

    return res.status(200).json({
      success: true,
      feature: "jd-parser",
      result: {
        extractedSkills,
        minCgpa: cgpaMatch ? Number(cgpaMatch[1]) : 7,
        rounds: roundsMatch ? Number(roundsMatch[1]) : 3,
        recommendedBranches: ["CSE", "IT", "ECE"],
        summary: "Structured JD generated from provided description."
      }
    });
  } catch (error) {
    console.error("parseJobDescription error:", error);
    return res.status(500).json({ success: false, message: "Failed to parse job description" });
  }
};

export const reviewApplication = async (req, res) => {
  try {
    const { form = {} } = req.body || {};
    const fields = ["fullName", "email", "skills", "projects", "statement"];
    const missing = fields.filter((field) => !String(form[field] || "").trim());
    const clarityScore = Math.max(0, 100 - missing.length * 18);

    return res.status(200).json({
      success: true,
      feature: "application-review",
      result: {
        clarityScore,
        missingFields: missing,
        suggestions: [
          "Add measurable outcomes for projects.",
          "Use concise STAR-style achievement bullets.",
          "Align statement with target role requirements."
        ]
      }
    });
  } catch (error) {
    console.error("reviewApplication error:", error);
    return res.status(500).json({ success: false, message: "Failed to review application" });
  }
};

export const generateAnalyticsNarrative = async (req, res) => {
  try {
    const { metrics = {} } = req.body || {};
    const placementRate = numberValue(metrics.placementRate, 0);
    const interviews = numberValue(metrics.interviews, 0);
    const openJobs = numberValue(metrics.openJobs, 0);
    const pendingApprovals = numberValue(metrics.pendingApprovals, 0);

    const narrative = [
      `Placement rate is currently ${placementRate}%.`,
      `${interviews} interviews are active with ${openJobs} open job postings.`,
      `${pendingApprovals} approvals are pending and should be prioritized to avoid SLA delays.`,
      placementRate < 75
        ? "Primary risk: conversion from shortlisted to selected is below target; increase mock interview support."
        : "Momentum is healthy; focus on high-package role conversion and faster offer closure."
    ].join(" ");

    return res.status(200).json({
      success: true,
      feature: "analytics-narrative",
      result: { narrative }
    });
  } catch (error) {
    console.error("generateAnalyticsNarrative error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate analytics narrative" });
  }
};

export const knowledgeBaseAnswer = async (req, res) => {
  try {
    const { question = "" } = req.body || {};
    const q = String(question || "").trim();
    if (!q) {
      return res.status(400).json({ success: false, message: "question is required" });
    }

    const prompt = [
      "You are a campus placement policy assistant.",
      "Answer briefly with actionable steps.",
      `Question: ${q}`
    ].join("\n");

    const geminiText = await askGemini(prompt);
    const fallback = "Please check eligibility, update profile/resume, verify deadlines in the portal, and contact placement staff for role-specific clarifications.";

    return res.status(200).json({
      success: true,
      feature: "knowledge-base",
      result: {
        answer: geminiText || fallback
      }
    });
  } catch (error) {
    console.error("knowledgeBaseAnswer error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate knowledge base answer" });
  }
};