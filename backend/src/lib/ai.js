import { GoogleGenAI } from '@google/genai';

let aiClient = null;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

/**
 * Generate AI Lecture Resource Summary & Key Takeaways
 */
export async function generateResourceSummary(title, courseCode, description) {
  const ai = getAIClient();
  
  if (ai) {
    try {
      const prompt = `You are UniPortal AI, an expert academic tutor for Metropolitan University. 
Analyze and summarize the following study material/lecture note for course ${courseCode} - "${title}":

Content/Description:
${description || title}

Return a valid JSON object strictly matching this schema (do NOT wrap in markdown code blocks, just raw JSON):
{
  "overview": "A 2-3 sentence clear executive overview",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3", "Takeaway 4"],
  "highYieldTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "readTimeMinutes": 2
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const rawText = response.text?.trim() || '';
      const cleanJsonText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonText);
      return {
        title,
        courseCode,
        overview: parsed.overview || description,
        keyTakeaways: parsed.keyTakeaways || [],
        highYieldTopics: parsed.highYieldTopics || [],
        readTimeMinutes: parsed.readTimeMinutes || 2,
        isRealAI: true
      };
    } catch (err) {
      console.warn('Gemini AI summarize call fallback:', err.message);
    }
  }

  // Smart Fallback if API Key not provided or rate limited
  const sentences = (description || '')
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(Boolean);

  return {
    title,
    courseCode,
    overview: sentences.length > 0
      ? sentences.slice(0, 2).join('. ') + '.'
      : `Comprehensive study guide and lecture notes for ${title} (${courseCode}). Covers core domain principles, sample problems, and exam review guidelines.`,
    keyTakeaways: sentences.length > 2
      ? sentences.slice(2, 6)
      : [
          `Fundamental concepts of ${title}`,
          `Practical implementation and design patterns`,
          `High-frequency midterm & final examination questions`,
          `Best practices for academic problem solving`
        ],
    highYieldTopics: [
      `${courseCode} Core Definitions & Architectural Models`,
      `Performance Optimization & Algorithmic Complexity`,
      `Case Studies & Practical Applied Examples`
    ],
    readTimeMinutes: Math.max(1, Math.ceil((description?.length || 300) / 200)),
    isRealAI: false
  };
}

/**
 * Generate AI Practice Quiz & Analysis from Past Question Papers
 */
export async function analyzeExamPaper(title, courseCode, description) {
  const ai = getAIClient();

  if (ai) {
    try {
      const prompt = `You are UniPortal AI, an expert exam preparation assistant.
Analyze this past question paper titled "${title}" for course ${courseCode}:

Description: ${description || title}

Return a valid JSON object strictly matching this schema (do NOT wrap in markdown code blocks, just raw JSON):
{
  "topicWeightage": [
    { "topic": "Topic A", "weightagePct": 40 },
    { "topic": "Topic B", "weightagePct": 35 },
    { "topic": "Topic C", "weightagePct": 25 }
  ],
  "practiceQuiz": [
    {
      "question": "Sample Question 1",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief solution explanation"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const rawText = response.text?.trim() || '';
      const cleanJsonText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonText);
      return {
        ...parsed,
        isRealAI: true
      };
    } catch (err) {
      console.warn('Gemini AI exam analysis fallback:', err.message);
    }
  }

  // Fallback Quiz Generator
  return {
    topicWeightage: [
      { topic: `${courseCode} Core Definitions & Theory`, weightagePct: 40 },
      { topic: `${courseCode} Practical Problem Solving`, weightagePct: 35 },
      { topic: `${courseCode} Architecture & Design`, weightagePct: 25 }
    ],
    practiceQuiz: [
      {
        question: `What is the primary objective covered in ${title}?`,
        options: [
          'Optimizing algorithmic time complexity and data memory usage',
          'Formatting hardware registers for manual I/O operations',
          'Static compile-time array memory reallocation',
          'Disabling error handling exceptions'
        ],
        correctAnswer: 'Optimizing algorithmic time complexity and data memory usage',
        explanation: 'Core computer science courses focus on performance optimization and memory efficiency.'
      },
      {
        question: `Which approach is recommended when addressing ${courseCode} exam questions?`,
        options: [
          'Draw structured block diagrams before writing solution code',
          'Skip prerequisite definitions and state final answers',
          'Use arbitrary non-standard variable identifiers',
          'Avoid checking edge cases'
        ],
        correctAnswer: 'Draw structured block diagrams before writing solution code',
        explanation: 'Visualizing system design before writing code improves solution clarity and accuracy.'
      }
    ],
    isRealAI: false
  };
}

/**
 * Generate AI Academic & CGPA Strategy Advice
 */
export async function generateAcademicAdvice(currentCGPA, targetCGPA, completedCredits, attendancePct) {
  const ai = getAIClient();

  if (ai) {
    try {
      const prompt = `You are UniPortal AI Academic Advisor.
Give concise, actionable academic advice for a university student with:
- Current CGPA: ${currentCGPA} / 4.00
- Target CGPA: ${targetCGPA} / 4.00
- Completed Credits: ${completedCredits}
- Current Attendance Rate: ${attendancePct}%

Return a valid JSON object strictly matching this schema (do NOT wrap in markdown code blocks, just raw JSON):
{
  "verdict": "Encouraging 1-sentence verdict",
  "weeklyStudyHours": 14,
  "actionSteps": ["Step 1", "Step 2", "Step 3"],
  "attendanceAdvice": "Advice on attendance status"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const rawText = response.text?.trim() || '';
      const cleanJsonText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonText);
      return {
        ...parsed,
        isRealAI: true
      };
    } catch (err) {
      console.warn('Gemini AI academic advice fallback:', err.message);
    }
  }

  // Fallback advice
  return {
    verdict: currentCGPA >= targetCGPA 
      ? 'Great job! You are currently on track to achieve your honors target.' 
      : 'Achievable goal! Focused study in upcoming core courses will elevate your CGPA.',
    weeklyStudyHours: Math.max(12, Math.round((4.0 - currentCGPA) * 10 + 10)),
    actionSteps: [
      'Focus 60% of study time on high-credit 3.0 and 4.0 unit courses',
      'Solve previous year class test (CT) and midterm question papers',
      'Maintain active participation in laboratory sessions and assignments'
    ],
    attendanceAdvice: attendancePct < 75 
      ? '⚠️ Warning: Attendance is below 75%. Prioritize attending all remaining lectures to prevent admit card disqualification.' 
      : 'Good attendance standing. Keep attending regularly.',
    isRealAI: false
  };
}
