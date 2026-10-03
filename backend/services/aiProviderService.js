const OpenAI = require("openai");
const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");

let openaiClient = null;
let geminiClient = null;
let groqClient = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY.");
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY.");
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY.");
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

/**
 * Generates an AI tutor response using a provider (OpenAI, Gemini, Groq).
 */
exports.generateTutorResponse = async (data) => {
  const provider = (process.env.AI_PROVIDER || "openai").trim().toLowerCase();
  console.log(`[AI Tutor] Selected provider: ${provider}`);

  const { 
    mode, 
    message, 
    lessonTitle, 
    lessonContext, 
    courseTitle, 
    courseTags,
    weakTopics,
    quizStats,
    questionExplanations
  } = data;

  let systemPrompt = "";

  if (mode === "lesson_summary") {
    systemPrompt = `
You are an expert educational AI Tutor inside a Learning Management System (LMS).
Your task is to generate a concise, highly readable summary of the provided lesson content.

STRICT RULES:
1. Provide a short overarching summary (2-3 sentences).
2. List 3-5 Key Points.
3. If "Weak Topics" are provided, add a specific "Focus Areas" section explaining those concepts simply.
4. Do NOT use markdown headers (like # or ##) to avoid clashing with the UI, just use bold text or bullet points.
5. Use only the provided lesson content: "${lessonContext}"
${weakTopics && weakTopics.length > 0 ? `\nWeak Topics to Focus On: ${(weakTopics || []).join(", ")}` : ""}
    `.trim();
  } else {
    systemPrompt = `
You are an expert educational AI Tutor inside a Learning Management System (LMS).
Your goal is to help students learn effectively by providing concise, beginner-friendly, and encouraging explanations.

STRICT RULES:
1. RESPONSE SCOPE:
   - Only answer questions related to the current lesson: "${lessonTitle}" or the course: "${courseTitle}".
   - If the question is completely unrelated (off-topic), respond exactly: "I can only help with this lesson or course content. Please ask something related to your studies."
   - If the question is related to the course/field but not covered in the lesson slides, say: "This is related to the course, but not directly covered in the current lesson." then provide a short conceptual explanation.

2. CONTEXT AWARENESS:
   - Use the provided Lesson Content: "${lessonContext}"
   - Use the Course Tags: "${(courseTags || []).join(", ")}"

3. QUIZ INTEGRITY:
   - Do not give direct answers to quiz questions if the student is currently taking a quiz.
   - For post-quiz review, use the provided results to explain concepts where the student struggled.

4. TONE:
   - Be professional, patient, and encouraging.
   - Keep answers concise (max 3-4 sentences unless a detailed explanation is necessary).

Current Mode: ${mode === "post_quiz_help" ? "Post-Quiz Remediation" : "Lesson Assistance"}
${mode === "post_quiz_help" ? `
Student Results:
- Score: ${quizStats?.scorePercent}%
- Weak Topics: ${(weakTopics || []).join(", ")}
- Relevant Explanations: ${questionExplanations}
` : ""}
    `.trim();
  }

  let reply = "";

  try {
    if (provider === "openai") {
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      reply = response.choices[0].message.content;
    } else if (provider === "gemini") {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
          maxOutputTokens: 500
        }
      });
      reply = response.text;
    } else if (provider === "groq") {
      const groq = getGroqClient();
      const response = await groq.chat.completions.create({
        model: "llama3-8b-8192", // default free groq model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      reply = response.choices[0].message.content;
    } else {
      throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
    }

    let scope = "lesson_content";
    if (reply.includes("not directly covered in the current lesson")) {
      scope = "course_related";
    } else if (reply.includes("I can only help with this lesson")) {
      scope = "off_topic";
    }

    return {
      reply,
      scope,
      usedContext: true
    };
  } catch (error) {
    console.error(`[AI Tutor] Provider '${provider}' failed:`, error.message);
    throw error; // controller handles fallback
  }
};
