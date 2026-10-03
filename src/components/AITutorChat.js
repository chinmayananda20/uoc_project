import React, { useState, useRef, useEffect } from "react";
import { HiChatBubbleBottomCenterText, HiXMark, HiPaperAirplane } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { askTutor } from "../api/aiTutor.api";

export default function AITutorChat({ 
  mode, 
  courseId, 
  lessonId, 
  currentSlideIndex, 
  quizAttemptId, 
  disabled,
  context
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hello! I'm your AI Tutor. How can I help you with this content?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || disabled) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const data = await askTutor({
        mode,
        message: userMessage,
        courseId,
        lessonId,
        currentSlideIndex,
        quizAttemptId,
        context
      });
      setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "I'm sorry, I'm having trouble connecting right now. Please try again later.";
      setMessages(prev => [...prev, { role: "ai", content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            className="absolute bottom-20 right-0 w-[360px] sm:w-[420px] h-[520px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-col overflow-hidden glow-blue"
          >
            {/* Header */}
            <div className="p-5 bg-slate-950 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <HiChatBubbleBottomCenterText className="w-5 h-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-950 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-100">Smart Path AI</h3>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Interactive Copilot</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors text-slate-400 hover:text-white"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-5 scroll-smooth"
            >
              {disabled ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-650 border border-slate-200/50 dark:border-slate-850">
                    <HiXMark className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                    AI Tutor is locked during quiz attempts to keep assessment fair.
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                        msg.role === "user" 
                          ? "bg-blue-600 text-white rounded-tr-none" 
                          : "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/30 dark:border-slate-850/60 whitespace-pre-wrap"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-905 p-4 rounded-2xl rounded-tl-none border border-slate-200/30 dark:border-slate-850/60">
                        <div className="flex gap-1.5 items-center py-1">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input Area */}
            {!disabled && (
              <form onSubmit={handleSend} className="p-4 border-t border-slate-150 dark:border-slate-900 bg-slate-50 dark:bg-slate-950 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your AI tutor anything..."
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shrink-0"
                >
                  <HiPaperAirplane className="w-4 h-4 rotate-45 -translate-y-0.5 -translate-x-0.5" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-650 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center text-white relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <HiXMark className="w-6 h-6" /> : <HiChatBubbleBottomCenterText className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
