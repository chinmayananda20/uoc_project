import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  adminCreateQuizForLesson,
  getQuizByLessonId,
  adminUpdateQuiz,
  adminCreateQuestion,
  getQuestionsByQuiz,
  adminUpdateQuestion,
  adminDeleteQuestion,
} from "../api/adminQuizzes.api";

function toastLoadingOnce(id, msg) {
  if (toast.isActive(id)) return id;
  return toast.loading(msg, { toastId: id });
}

export default function AdminQuizBuilder({ lessonId }) {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  // Quiz edit state
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: "", passPercent: 70, timeLimitSec: 0 });
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Question edit state
  const [editingQId, setEditingQId] = useState(null); // null = not editing; "NEW" = adding new; <id> = editing existing
  const [qForm, setQForm] = useState(null);
  const [savingQ, setSavingQ] = useState(false);

  const loadData = useCallback(async () => {
    if (!lessonId) return;
    try {
      setLoading(true);
      const qz = await getQuizByLessonId(lessonId);
      setQuiz(qz);
      
      const qs = await getQuestionsByQuiz(qz._id);
      setQuestions(Array.isArray(qs) ? qs : []);
    } catch (e) {
      if (e?.response?.status !== 404) {
        toast.error(e?.response?.data?.message || "Failed to load quiz");
      }
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  // ---- QUIZ HANDLERS ----

  const openQuizForm = (isNew = false) => {
    if (isNew) {
      setQuizForm({ title: "Lesson Quiz", passPercent: 70, timeLimitSec: 0 });
    } else {
      setQuizForm({ 
        title: quiz?.title || "", 
        passPercent: quiz?.passPercent ?? 70, 
        timeLimitSec: quiz?.timeLimitSec ?? 0 
      });
    }
    setIsEditingQuiz(true);
  };

  const saveQuiz = async () => {
    if (!quizForm.title.trim()) {
      return toast.error("Quiz title is required");
    }

    toastLoadingOnce("quiz-save", quiz ? "Updating quiz..." : "Creating quiz...");
    setSavingQuiz(true);
    
    try {
      let qz;
      if (quiz) {
        qz = await adminUpdateQuiz(quiz._id, quizForm);
        toast.update("quiz-save", { render: "Quiz updated", type: "success", isLoading: false, autoClose: 1500 });
      } else {
        qz = await adminCreateQuizForLesson(lessonId, quizForm);
        toast.update("quiz-save", { render: "Quiz created", type: "success", isLoading: false, autoClose: 1500 });
      }
      setQuiz(qz);
      setIsEditingQuiz(false);
    } catch (e) {
      toast.update("quiz-save", { render: e?.response?.data?.message || "Failed to save quiz", type: "error", isLoading: false, autoClose: 2500 });
    } finally {
      setSavingQuiz(false);
    }
  };

  // ---- QUESTION HANDLERS ----

  const openQForm = (qId = "NEW") => {
    if (qId === "NEW") {
      setQForm({
        type: "mcq",
        prompt: "",
        topicTag: "General",
        difficulty: 1,
        order: questions.length ? Math.max(...questions.map(q => q.order || 0)) + 1 : 1,
        correctAnswer: "A",
        options: [
          { key: "A", text: "" },
          { key: "B", text: "" },
          { key: "C", text: "" },
          { key: "D", text: "" }
        ],
        explanation: "",
      });
    } else {
      const existing = questions.find(q => q._id === qId);
      if (existing) {
        setQForm(JSON.parse(JSON.stringify(existing))); // deep copy
      }
    }
    setEditingQId(qId);
  };

  const saveQuestion = async () => {
    if (!qForm.prompt.trim()) return toast.error("Prompt is required");
    if (!qForm.topicTag.trim()) return toast.error("Topic tag is required");
    if (qForm.correctAnswer === undefined || qForm.correctAnswer === "") return toast.error("Correct answer is required");

    toastLoadingOnce("q-save", "Saving question...");
    setSavingQ(true);

    try {
      const payload = { ...qForm };
      payload.topic = payload.topicTag;
      // Cleanup payload based on type
      if (payload.type === "truefalse") {
        payload.options = [];
        if (payload.correctAnswer !== "true" && payload.correctAnswer !== "false") {
          payload.correctAnswer = "true";
        }
      }

      if (editingQId === "NEW") {
        const newQ = await adminCreateQuestion(quiz._id, payload);
        setQuestions(prev => [...prev, newQ]);
      } else {
        const updated = await adminUpdateQuestion(editingQId, payload);
        setQuestions(prev => prev.map(q => q._id === editingQId ? updated : q));
      }

      toast.update("q-save", { render: "Question saved", type: "success", isLoading: false, autoClose: 1500 });
      setEditingQId(null);
    } catch (e) {
      toast.update("q-save", { render: e?.response?.data?.message || "Failed to save question", type: "error", isLoading: false, autoClose: 2500 });
    } finally {
      setSavingQ(false);
    }
  };

  const deleteQuestion = async (qId) => {
    if (!window.confirm("Delete this question?")) return;
    toastLoadingOnce("q-del", "Deleting...");
    try {
      await adminDeleteQuestion(qId);
      setQuestions(prev => prev.filter(q => q._id !== qId));
      toast.update("q-del", { render: "Deleted", type: "success", isLoading: false, autoClose: 1500 });
    } catch(e) {
      toast.update("q-del", { render: e?.response?.data?.message || "Failed to delete", type: "error", isLoading: false, autoClose: 2500 });
    }
  }


  if (loading) return <div className="p-4 text-sm text-slate-500 dark:text-slate-400 animate-pulse font-medium">Loading quiz data...</div>;

  return (
    <div className="mt-6 rounded-3xl border border-blue-200 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10 p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-blue-900 dark:text-blue-400 tracking-tight uppercase">Quiz Manager</h3>
        {!quiz && !isEditingQuiz && (
           <button onClick={() => openQuizForm(true)} className="rounded-xl bg-blue-600 px-5 py-2.5 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
             Create Quiz
           </button>
        )}
      </div>

      {isEditingQuiz ? (
        <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8">
          <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">{quiz ? "Quiz Settings" : "New Quiz Settings"}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Title</label>
              <input value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all" />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Pass %</label>
              <input type="number" min="0" max="100" value={quizForm.passPercent} onChange={e => setQuizForm({...quizForm, passPercent: Number(e.target.value)})} className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all text-center" />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Timer (sec)</label>
              <input type="number" min="0" value={quizForm.timeLimitSec} onChange={e => setQuizForm({...quizForm, timeLimitSec: Number(e.target.value)})} className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all text-center" placeholder="0 = infinite" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={saveQuiz} disabled={savingQuiz} className="flex-1 sm:flex-none rounded-2xl bg-blue-600 px-8 py-3.5 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50">Save Quiz</button>
            <button onClick={() => setIsEditingQuiz(false)} className="flex-1 sm:flex-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-8 py-3.5 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95">Cancel</button>
          </div>
        </div>
      ) : quiz ? (
        <div className="mb-8 rounded-[1.5rem] border border-blue-100 dark:border-blue-900/30 bg-white dark:bg-slate-900 p-6 flex items-center justify-between shadow-sm transition-colors">
           <div>
              <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{quiz.title}</div>
              <div className="mt-1 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
                Pass: <span className="text-blue-600 dark:text-blue-400">{quiz.passPercent}%</span> 
                <span className="mx-2">•</span> 
                Time: <span className="text-blue-600 dark:text-blue-400">{quiz.timeLimitSec ? `${quiz.timeLimitSec}s` : "Infinite"}</span> 
                <span className="mx-2">•</span> 
                Ver: {quiz.version}
              </div>
           </div>
           <button onClick={() => openQuizForm()} className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95">Edit Settings</button>
        </div>
      ) : (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic mb-4">No quiz attached to this lesson.</p>
      )}

      {/* QUESTIONS LIST */}
      {quiz && !editingQId && (
        <div className="space-y-6">
           <div className="flex items-center justify-between mb-4">
             <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Questions ({questions.length})</h4>
             <button onClick={() => openQForm("NEW")} className="rounded-xl bg-slate-900 dark:bg-white px-5 py-2.5 text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-lg active:scale-95">
               + Add Question
             </button>
           </div>
           
            <div className="space-y-4">
              {questions.length === 0 && <div className="text-sm font-medium text-slate-500 dark:text-slate-400 italic p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">No questions added yet. Get started by adding your first one!</div>}
              {questions.sort((a,b) => a.order - b.order).map((q, i) => (
                <div key={q._id} className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm hover:shadow-xl transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        Q0{i+1} • {q.type.toUpperCase()} • {q.topicTag}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => openQForm(q._id)} className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Edit</button>
                        <button onClick={() => deleteQuestion(q._id)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors">Delete</button>
                      </div>
                   </div>
                   <div className="text-base font-bold text-slate-900 dark:text-white mb-6 whitespace-pre-wrap leading-relaxed tracking-tight">{q.prompt}</div>
                   
                   {q.type === 'mcq' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map(opt => (
                          <div key={opt.key} className={`text-xs p-4 border rounded-2xl transition-all font-medium ${q.correctAnswer === opt.key ? 'border-green-500 dark:border-green-500/50 bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-400 shadow-md shadow-green-500/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'}`}>
                            <span className="font-black text-[10px] mr-2 uppercase tracking-widest opacity-60">{opt.key}</span> {opt.text}
                          </div>
                        ))}
                      </div>
                   )}
                   {q.type === 'truefalse' && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">
                         Answer: {q.correctAnswer}
                      </div>
                   )}
               </div>
             ))}
           </div>
        </div>
       )}
 
       {/* QUESTION EDITOR */}
       {quiz && editingQId && qForm && (
         <div className="mt-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-2xl transition-colors animate-in zoom-in-95 duration-200">
            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-8">{editingQId === "NEW" ? "Create Question" : "Refine Question"}</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Type</label>
                 <select value={qForm.type} onChange={e => setQForm({...qForm, type: e.target.value})} className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium">
                    <option value="mcq">Multiple Choice</option>
                    <option value="truefalse">True / False</option>
                 </select>
               </div>
               <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Topic Tag</label>
                 <input value={qForm.topicTag} onChange={e => setQForm({...qForm, topicTag: e.target.value})} className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" />
               </div>
               <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Subtopic</label>
                 <input value={qForm.subtopic || ""} onChange={e => setQForm({...qForm, subtopic: e.target.value})} className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" />
               </div>
               <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Difficulty (1-5)</label>
                 <div className="grid grid-cols-2 gap-2 mt-2">
                    <input type="number" min="1" max="5" value={qForm.difficulty} onChange={e => setQForm({...qForm, difficulty: Number(e.target.value)})} className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-center" />
                    <select
  value={qForm.difficultyLevel || "medium"}
  onChange={e => setQForm({...qForm, difficultyLevel: e.target.value})}
>
  <option value="easy">Easy</option>
  <option value="medium">Medium</option>
  <option value="hard">Hard</option>
</select>
                 </div>
               </div>
               <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Sort Order</label>
                 <input type="number" min="1" value={qForm.order} onChange={e => setQForm({...qForm, order: Number(e.target.value)})} className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-center" />
               </div>
            </div>

            <div className="mb-6">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Prompt / Question Content</label>
               <textarea rows={4} value={qForm.prompt} onChange={e => setQForm({...qForm, prompt: e.target.value})} className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium resize-none leading-relaxed" placeholder="Type your question here..."></textarea>
            </div>

           {(qForm.type === 'mcq' || qForm.type === 'multi') && (
             <div className="mb-4">
               <label className="text-xs font-semibold text-slate-700 mb-2 block">Options</label>
               <div className="space-y-2">
                 {qForm.options?.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input className="w-12 rounded-lg border border-slate-300 px-2 py-1 text-sm text-center font-bold" value={opt.key} onChange={e => {
                         const newOpts = [...qForm.options];
                         newOpts[idx].key = e.target.value;
                         setQForm({...qForm, options: newOpts});
                      }} />
                      <input className="flex-1 rounded-lg border border-slate-300 px-3 py-1 text-sm" value={opt.text} onChange={e => {
                         const newOpts = [...qForm.options];
                         newOpts[idx].text = e.target.value;
                         setQForm({...qForm, options: newOpts});
                      }} placeholder="Option text..." />
                    </div>
                 ))}
                 <button className="text-xs font-semibold text-blue-600 mt-1" onClick={() => setQForm({...qForm, options: [...(qForm.options || []), {key: "", text: ""}]})}>
                   + Add Option
                 </button>
               </div>
             </div>
           )}

            <div className="mb-6">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Correct Answer(s)</label>
               {qForm.type === 'truefalse' ? (
                  <select value={qForm.correctAnswer} onChange={e => setQForm({...qForm, correctAnswer: e.target.value})} className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium">
                     <option value="true">True</option>
                     <option value="false">False</option>
                  </select>
               ) : (
                 <input value={qForm.correctAnswer} onChange={e => setQForm({...qForm, correctAnswer: e.target.value})} className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" placeholder={qForm.type === 'mcq' ? "e.g. A" : "e.g. A,C or exact match"} />
               )}
            </div>

            <div className="mb-8">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Expert Explanation (Optional)</label>
               <textarea rows={3} value={qForm.explanation} onChange={e => setQForm({...qForm, explanation: e.target.value})} className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium resize-none leading-relaxed" placeholder="Explain the reasoning behind the correct answer..."></textarea>
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button onClick={saveQuestion} disabled={savingQ} className="flex-1 sm:flex-none rounded-2xl bg-blue-600 px-10 py-4 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50">Save Question</button>
              <button onClick={() => setEditingQId(null)} className="flex-1 sm:flex-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-10 py-4 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95">Discard</button>
            </div>
        </div>
      )}

    </div>
  );
}
