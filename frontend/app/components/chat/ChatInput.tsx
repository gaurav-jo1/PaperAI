"use client";

import { useState } from "react";
import { Send, Loader2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  selectedDocIds: Set<string>;
}

export default function ChatInput({
  onSend,
  isLoading,
  selectedDocIds,
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
          <div className="absolute inset-0 bg-linear-to-r from-cyan-400 to-blue-400 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
          <div className="relative flex items-center bg-white/80 backdrop-blur-sm border border-cyan-100 rounded-full shadow-sm hover:shadow-md transition-all duration-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="w-full py-4 pl-6 pr-32 text-sm bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
            />

            {/* Selection Badge */}
            <AnimatePresence>
              {selectedDocIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-12 flex items-center"
                >
                  <div className="flex items-center space-x-1.5 bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-full border border-cyan-100">
                    <FileText size={12} />
                    <span className="text-xs font-medium whitespace-nowrap">
                      {selectedDocIds.size} selected
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Send / Loading button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:opacity-90 transition-opacity shadow-sm cursor-pointer z-10 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}
