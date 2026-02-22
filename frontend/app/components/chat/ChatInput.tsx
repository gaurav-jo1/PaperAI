"use client";

import { useState } from "react";
import { Send, Loader2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  selectedDocIds: Set<string>;
  isDeepResearch: boolean;
  onToggleDeepResearch: () => void;
}

export default function ChatInput({
  onSend,
  isLoading,
  selectedDocIds,
  isDeepResearch,
  onToggleDeepResearch,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full px-4 pb-10 pt-2 relative z-10">
      <div className="max-w-3xl mx-auto">
        <div className="relative group">
          <div
            className={`absolute inset-0 bg-linear-to-r ${
              isDeepResearch
                ? "from-indigo-500 to-purple-600 blur-lg opacity-30 group-hover:opacity-50"
                : "from-cyan-400 to-blue-400 blur-md opacity-20 group-hover:opacity-40"
            } rounded-3xl transition-all duration-500`}
          />

          <div
            className={`relative flex flex-col bg-white/80 backdrop-blur-sm border ${
              isDeepResearch
                ? "border-indigo-200 shadow-xl shadow-indigo-100/50"
                : "border-cyan-100 shadow-sm"
            } rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-md pt-1 pb-2`}
          >
            {/* Input Row */}
            <div className="relative flex items-center w-full">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isDeepResearch
                    ? "Ask me anything for deep research..."
                    : "Ask me anything..."
                }
                disabled={isLoading}
                className="w-full py-3 pl-6 pr-4 text-sm bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between px-4 pt-1">
              {/* Bottom Left: Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer group pl-2">
                <span
                  className={`text-[13px] font-semibold tracking-wide select-none transition-colors duration-300 ${
                    isDeepResearch
                      ? "text-indigo-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  Deep Research
                </span>
                <div className="relative flex items-center shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isDeepResearch}
                    onChange={onToggleDeepResearch}
                  />
                  <div
                    className={`block w-8 rounded-full transition-colors duration-300 ease-in-out ${
                      isDeepResearch
                        ? "bg-indigo-500"
                        : "bg-slate-200 group-hover:bg-slate-300"
                    }`}
                    style={{ height: "18px" }}
                  ></div>
                  <div
                    className={`absolute left-[2px] bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm ${
                      isDeepResearch ? "translate-x-[14px]" : "translate-x-0"
                    }`}
                    style={{ height: "14px", width: "14px" }}
                  ></div>
                </div>
              </label>

              {/* Bottom Right: Selection Badge & Send Button */}
              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {selectedDocIds.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <div
                        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border ${
                          isDeepResearch
                            ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                            : "bg-cyan-50 text-cyan-700 border-cyan-100"
                        }`}
                      >
                        <FileText size={12} />
                        <span className="text-xs font-medium whitespace-nowrap">
                          {selectedDocIds.size} selected
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !input.trim()}
                  className={`p-2 text-white rounded-full hover:opacity-90 transition-all shadow-sm cursor-pointer z-10 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDeepResearch
                      ? "bg-linear-to-r from-indigo-500 to-purple-600 shadow-indigo-200"
                      : "bg-linear-to-r from-cyan-500 to-blue-600 shadow-cyan-200"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
