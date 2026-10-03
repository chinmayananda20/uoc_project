const { GoogleGenAI } = require("@google/genai");

let geminiClient = null;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY.");
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// --- Similarity Helpers ---
function normalizeForSimilarity(text) {
  if (!text) return "";
  const stopWords = new Set(["the", "is", "at", "which", "on", "in", "a", "an", "and", "or", "to", "of", "for", "with", "what", "how", "why", "are", "do", "does", "did"]);
  return text.toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 0 && !stopWords.has(word))
    .join(" ");
}

function tokenizeForSimilarity(text) {
  return new Set(normalizeForSimilarity(text).split(" "));
}

function jaccardSimilarity(textA, textB) {
  const setA = tokenizeForSimilarity(textA);
  const setB = tokenizeForSimilarity(textB);
  
  if (setA.size === 0 && setB.size === 0) return 0;

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
}

function isTooSimilarToSource(generatedQuestionText, sourcePrompts) {
  const normGen = normalizeForSimilarity(generatedQuestionText);
  if (!normGen) return false;

  for (const prompt of sourcePrompts) {
    const normPrompt = normalizeForSimilarity(prompt);
    
    // Substring check (if generated contains most of the original prompt)
    if (normPrompt.length > 15 && normGen.includes(normPrompt)) return true;
    
    // Jaccard check
    const sim = jaccardSimilarity(generatedQuestionText, prompt);
    if (sim > 0.45) return true;
  }
  return false;
}

// --- Generator ---
exports.generatePracticeQuestionsWithGemini = async (data) => {
  const {
    weakTopics,
    masteryLevel,
    practiceType,
    lessonTitle,
    lessonContext,
    sourceQuestions
  } = data;

  const ai = getGeminiClient();

  const sourcePrompts = sourceQuestions.map(q => q.prompt);
  const sourceQuestionContext = sourceQuestions.map(q => 
    `- [${q.topicTag}]: ${q.prompt}`
  ).join("\n");

  let practiceInstruction = "";
  if (practiceType === "remedial") {
    practiceInstruction = `
- Create beginner-friendly concept-check questions.
- Do not ask the same thing as the quiz.
- Use simple examples from the lesson.
- Avoid copying original wording.
- Questions should test basic understanding.`;
  } else if (practiceType === "reinforcement") {
    practiceInstruction = `
- Create applied understanding questions.
- Use small scenarios or code-reading examples.
- Do not copy original quiz question structure.
- Questions should require the learner to apply the concept.`;
  } else {
    practiceInstruction = `
- Create harder real-system or problem-solving questions.
- Create scenario-style questions testing advanced synthesis.`;
  }

  const baseSystemInstruction = `
You are generating adaptive practice questions for an LMS.
Use only the provided lesson content and weak topics.

CRITICAL INSTRUCTION: Do NOT rewrite, paraphrase, or lightly modify the original quiz questions. Use the original quiz questions only to understand what the learner struggled with. Create completely NEW questions from the lesson content.

Practice type rules for ${practiceType}:
${practiceInstruction}

Target Mastery Level: ${masteryLevel}

Return this exact JSON structure:
{
  "questions": [
    {
      "questionText": "string",
      "options": [
        { "key": "A", "text": "string" },
        { "key": "B", "text": "string" },
        { "key": "C", "text": "string" },
        { "key": "D", "text": "string" }
      ],
      "correctAnswer": "A",
      "explanation": "string",
      "topicTag": "string",
      "difficultyLevel": "easy"
    }
  ]
}

Validation rules:
- Generate exactly 8 questions.
- Each question must have exactly 4 options.
- correctAnswer must be A, B, C or D.
- difficultyLevel must be easy, medium or hard.
- questionText must NOT be identical or too similar to any original quiz prompt.
- explanation must not be empty.
- topicTag must not be empty.
  `.trim();

  const generateCall = async (retryPrompt = "") => {
    const userPrompt = `
Lesson Title: ${lessonTitle}
Weak Topics: ${(weakTopics || []).join(", ")}

Lesson Content:
${lessonContext}

ORIGINAL_QUIZ_QUESTIONS_TO_AVOID:
${sourceQuestionContext}

${retryPrompt}
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: baseSystemInstruction,
        temperature: retryPrompt ? 0.9 : 0.7, // Increase temp on retry for more variety
        responseMimeType: "application/json",
      }
    });

    let resultJson = response.text;
    if (resultJson.startsWith('```json')) {
        resultJson = resultJson.replace(/^```json\n/, '').replace(/\n```$/, '');
    }

    const parsed = JSON.parse(resultJson);
    if (!parsed || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid format returned by Gemini");
    }
    return parsed.questions;
  };

  let generatedQuestions = [];
  let validQuestions = [];
  let rejectedSimilarCount = 0;
  let generationNotes = "First attempt successful.";

  try {
    generatedQuestions = await generateCall();
    
    // Filter
    for (const q of generatedQuestions) {
      if (isTooSimilarToSource(q.questionText, sourcePrompts)) {
        rejectedSimilarCount++;
      } else {
        validQuestions.push(q);
      }
    }

    // Retry logic if we filtered out too many
    if (validQuestions.length < 3) {
      generationNotes = `Retry needed. Rejected ${rejectedSimilarCount} questions for being too similar to source.`;
      const retryPrompt = "The previous output was too similar to the original quiz questions. You MUST generate completely new scenario or concept-check questions that do not resemble the ones in ORIGINAL_QUIZ_QUESTIONS_TO_AVOID.";
      
      const retryQuestions = await generateCall(retryPrompt);
      
      for (const q of retryQuestions) {
        if (isTooSimilarToSource(q.questionText, sourcePrompts)) {
          rejectedSimilarCount++;
        } else {
          validQuestions.push(q);
        }
      }
    }

    // Final limit and validation
    if (validQuestions.length < 3) {
      throw new Error(`Failed to generate enough unique questions after retry. Only ${validQuestions.length} valid questions generated.`);
    }

    // Take top 5
    const finalQuestions = validQuestions.slice(0, 5);

    return {
      questions: finalQuestions,
      rejectedSimilarCount,
      generationNotes
    };

  } catch (error) {
    console.error("Gemini Practice Generation Error:", error.message || error);
    throw error;
  }
};
