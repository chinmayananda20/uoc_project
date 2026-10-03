const STOP_WORDS = new Set(["a", "an", "the", "and", "or", "but", "if", "then", "else", "when", "at", "from", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "in", "on", "of", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "i", "me", "my", "you", "your", "he", "him", "his", "she", "her", "it", "its", "we", "us", "our", "they", "them", "their"]);

const BLOCKED_TOPICS = [
  "football", "betting", "movie", "movies", "instagram", "dating", "weather", 
  "politics", "crypto", "recipe", "recipes", "song", "songs", "gaming", "celebrity", "celebrities"
];

/**
 * Normalizes text: lowercase, remove punctuation, trim.
 */
function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

/**
 * Tokenizes text and removes stop words.
 */
function tokenize(text) {
  const normalized = normalizeText(text);
  return normalized
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Detects the user's intent.
 */
function detectIntent(message) {
  const text = message.toLowerCase();
  
  if (text.includes("explain") || text.includes("what is") || text.includes("definition")) return "explanation_request";
  if (text.includes("example") || text.includes("instance") || text.includes("show me")) return "example_request";
  if (text.includes("summary") || text.includes("summarize") || text.includes("brief")) return "summary_request";
  if (text.includes("compare") || text.includes("difference") || text.includes("versus") || text.includes(" vs ")) return "comparison_request";
  if (text.includes("why")) return "why_request";
  if (text.includes("how")) return "how_request";
  
  return "general_question";
}

/**
 * Checks if the message contains blocked topics.
 */
function isBlockedMessage(message) {
  const normalized = normalizeText(message);
  return BLOCKED_TOPICS.some(topic => normalized.includes(topic));
}

/**
 * Extracts text from lesson slides into searchable chunks.
 */
function extractTextFromSlides(slides) {
  if (!slides || !Array.isArray(slides)) return [];
  
  const chunks = [];
  slides.forEach((slide, index) => {
    (slide.elements || []).forEach(el => {
      let content = "";
      if (el.type === "heading" || el.type === "subheading" || el.type === "text") {
        content = el.data.text || "";
      } else if (el.type === "bullets" && Array.isArray(el.data.items)) {
        content = el.data.items.join(" ");
      }
      
      if (content) {
        chunks.push({
          slideIndex: index,
          label: el.type,
          text: content,
          tokens: tokenize(content)
        });
      }
    });
  });
  
  return chunks;
}

/**
 * Finds relevant chunks based on keyword matching.
 */
function retrieveRelevantChunks(message, chunks) {
  const messageTokens = tokenize(message);
  if (messageTokens.length === 0) return [];
  
  return chunks
    .map(chunk => {
      const matchCount = chunk.tokens.filter(token => messageTokens.includes(token)).length;
      return { ...chunk, score: matchCount };
    })
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

/**
 * Checks if the message is related to the course/lesson context.
 */
function isCourseRelated(message, contextKeywords) {
  const messageTokens = tokenize(message);
  const normalizedKeywords = contextKeywords.map(k => normalizeText(k)).filter(k => k.length > 0);
  
  return messageTokens.some(token => 
    normalizedKeywords.some(keyword => keyword.includes(token) || token.includes(keyword))
  );
}

/**
 * Builds a reply for lesson help.
 */
function buildLessonReply(intent, relevantChunks, isRelated) {
  if (relevantChunks.length > 0) {
    const mainChunk = relevantChunks[0];
    let prefix = "Based on the lesson content: ";
    if (intent === "explanation_request") prefix = "Here is an explanation from the lesson: ";
    if (intent === "summary_request") prefix = "To summarize what is mentioned in the slides: ";
    
    return `${prefix}\n\n"${mainChunk.text}"\n\n(Found on slide ${mainChunk.slideIndex + 1})`;
  }
  
  if (isRelated) {
    return "This is not directly explained in the current lesson slides, but it is related to the course. I recommend reviewing the course materials or asking your instructor for deeper details on this specific topic.";
  }
  
  return "I'm sorry, I couldn't find a direct answer in the current lesson. Could you try rephrasing or asking something specific to the slides?";
}

/**
 * Builds a reply for post-quiz feedback.
 */
function buildPostQuizReply(stats, questions) {
  const { scorePercent, masteryLevel, weakTopics } = stats;
  
  let reply = `Your performance: ${scorePercent}% (${masteryLevel.toUpperCase()} mastery).\n\n`;
  
  if (weakTopics && weakTopics.length > 0) {
    reply += `I noticed you struggled with: ${weakTopics.join(", ")}.\n\n`;
    
    const helpfulExplanations = questions
      .filter(q => weakTopics.includes(q.topicTag) && q.explanation)
      .slice(0, 3)
      .map(q => `• ${q.topicTag.toUpperCase()}: ${q.explanation}`)
      .join("\n\n");
      
    if (helpfulExplanations) {
      reply += `Here are some explanations to help you improve:\n\n${helpfulExplanations}`;
    }
  } else {
    reply += "Excellent work! You have shown strong mastery across all topics in this quiz.";
  }
  
  return reply;
}

module.exports = {
  normalizeText,
  tokenize,
  detectIntent,
  isBlockedMessage,
  extractTextFromSlides,
  retrieveRelevantChunks,
  isCourseRelated,
  buildLessonReply,
  buildPostQuizReply
};
