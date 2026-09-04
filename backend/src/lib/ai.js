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

/**
 * Chat with UniBot AI Assistant (General & Policy FAQs)
 */
export async function chatWithUniBot(userMessage, conversationHistory = [], userContext = {}) {
  const ai = getAIClient();

  const systemInstruction = `You are UniBot AI, the official intelligent academic assistant for Metropolitan University (UniPortal).
Be polite, professional, concise, and helpful. Use markdown formatting (bolding, bullet points) when listing steps.

Metropolitan University Policies & Portal Guidelines:
1. **Attendance Policy**: Minimum 75% class attendance is mandatory for exam permit qualification. Attendance under 75% triggers a Red Risk Alert and can block Admit Card generation.
2. **Section Transfer Requests**: Students cannot alter their assigned section directly. They submit a transfer request specifying target section (Section A to E) and reason. Admins review and approve/reject.
3. **One-Day Special Permits**: Students with tuition dues > ৳25,000 BDT can apply to faculty for a 1-day academic pass.
4. **Class Representative (CR) Capacity**: Enforces max 2 CRs per section. CRs can edit class routines.
5. **CGPA Scale**: Maximum 4.00 CGPA scale. (80%+ = A+ 4.00, 75-79% = A 3.75, 70-74% = A- 3.50, 65-69% = B+ 3.25, 60-64% = B 3.00, 55-59% = B- 2.75, 50-54% = C+ 2.50, 45-49% = C 2.25, 40-44% = D 2.00, <40% = F 0.00).
6. **Sick Leave & Exemption Desk**: Students submit medical notes/prescriptions for absence waiver approval by faculty.
7. **Resource Locker**: Access past CT (Class Test), Midterm, and Final question papers with AI Summarizer and model answer keys.

User Context:
Name: ${userContext.name || 'Student'}, Role: ${userContext.role || 'student'}, Section: ${userContext.section || 'Section A'}.`;

  if (ai) {
    try {
      const formattedHistory = conversationHistory.map(msg => `${msg.role === 'user' ? 'Student' : 'UniBot'}: ${msg.content}`).join('\n');
      const prompt = `${systemInstruction}\n\nRecent Conversation:\n${formattedHistory}\n\nStudent Question: ${userMessage}\n\nUniBot Response:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return {
        reply: response.text?.trim() || 'I am happy to assist you with any questions regarding UniPortal!',
        isRealAI: true
      };
    } catch (err) {
      console.warn('Gemini AI chat fallback:', err.message);
    }
  }

  // Smart FAQ Matcher Fallback
  const q = userMessage.toLowerCase();
  let reply = '';

  if (q.includes('section') || q.includes('transfer')) {
    reply = `🎓 **Section Transfer Workflow**:
1. Go to your **Profile** page.
2. Under **Section Details**, click **"Request Section Transfer"**.
3. Select your target section (Section A – E) and state your reason.
4. Admin will review and approve/reject your request.`;
  } else if (q.includes('attendance') || q.includes('risk') || q.includes('percent')) {
    reply = `⚠️ **Attendance Policy & Exam Eligibility**:
- Minimum **75% attendance** is required to qualify for examination admit cards.
- Attendance below 75% triggers an **Attendance Risk Alert**.
- If sick, submit a medical certificate via the **Sick Leave Desk** for faculty exemption.`;
  } else if (q.includes('permit') || q.includes('due') || q.includes('tuition')) {
    reply = `💳 **One-Day Special Permit**:
- If your tuition dues exceed **৳25,000 BDT**, you can apply for a 1-day pass.
- Go to **One-Day Permits**, select your faculty member, date, and reason.
- Once approved, download your verified PDF permission slip.`;
  } else if (q.includes('cgpa') || q.includes('gpa') || q.includes('grade')) {
    reply = `📊 **CGPA Scale & Simulator**:
- **A+** (80-100%) = 4.00 | **A** (75-79%) = 3.75 | **A-** (70-74%) = 3.50
- Use the **CGPA Calculator** page to simulate target grades for upcoming semesters and get **AI Study Strategies**!`;
  } else if (q.includes('admit') || q.includes('exam') || q.includes('hall')) {
    reply = `📄 **Exam & Admit Card Pass**:
- Visit **Exam & Admit Card** to view room allocations and invigilator schedules.
- Click **"View / Print Digital Admit Card"** to generate your official verified hall pass.`;
  } else {
    reply = `🤖 **UniBot AI Assistant**:
I am here to help you navigate UniPortal! You can ask me about:
- **Attendance & Minimum 75% Requirement**
- **Section Transfer Requests**
- **1-Day Dues Permission Slips**
- **CGPA Calculator & Grading Scale**
- **Sick Leave Applications & Exam Prep**`;
  }

  return { reply, isRealAI: false };
}

