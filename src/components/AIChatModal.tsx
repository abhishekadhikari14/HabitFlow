import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, fetchChatHistory } from '../lib/api';
import { Send, Brain, Sparkles, X, User, CheckCircle, ShieldCheck } from 'lucide-react';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

const SAMPLE_QUESTIONS = [
  'Why am I inconsistent on Thursdays?',
  'What causes me to miss workouts?',
  'Which habit should I adjust first?',
  'What is my strongest habit anchor?',
  'How does sleep affect my habit streak?'
];

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      if (initialPrompt) {
        setInput(initialPrompt);
      }
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadHistory = async () => {
    try {
      const history = await fetchChatHistory();
      if (history && history.length > 0) {
        setMessages(history);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleSend = async (questionToSend?: string) => {
    const text = questionToSend || input;
    if (!text.trim() || loading) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text.trim());
      if (res.message) {
        setMessages(prev => [...prev, res.message]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'I had trouble connecting to the behavioral analytics engine. Please try asking again in a moment.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[85vh] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  HabitFlow Coach
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Data-Grounded AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trained to analyze your real habits, sleep hours, and consistency blockers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message history */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Brain className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Grounded facts chip list if provided */}
                {m.groundedFacts && m.groundedFacts.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 mb-1">
                      <ShieldCheck className="w-3 h-3" /> Grounded in verified telemetry:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {m.groundedFacts.slice(0, 3).map((f: string, idx: number) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-spin" />
                Evaluating historical correlations and sleep patterns...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset quick question pills */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-1.5 whitespace-nowrap text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Suggestions:
            </span>
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-400 dark:hover:border-purple-600 text-xs transition-colors shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask HabitFlow Coach about your habits, consistency, or schedule..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
