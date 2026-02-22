"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import ChatMessage from "./ChatMessage";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  isDeepResearch: boolean;
}

export default function ChatArea({
  messages,
  isLoading,
  isDeepResearch,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Empty state — the original centered welcome UI
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-2xl flex flex-col items-center animate-in fade-in zoom-in duration-500 relative z-10">
          {/* Heading */}
          <div className="text-center mb-6">
            <h1
              className={`${
                isDeepResearch ? "text-5xl md:text-6xl" : "text-3xl md:text-5xl"
              } font-extrabold tracking-tighter transition-all duration-500`}
            >
              <span
                className={`bg-linear-to-r ${isDeepResearch ? "from-indigo-500 to-purple-600" : "from-cyan-500 to-blue-600"} bg-clip-text text-transparent transition-colors duration-500`}
              >
                {isDeepResearch ? "Deep Research" : "PaperAI"}
              </span>
            </h1>
          </div>

          {/* Subtext */}
          <p className="text-slate-400 text-xs font-medium text-center animate-pulse tracking-wide transition-all duration-300">
            {isDeepResearch
              ? "AI-powered financial analysis using specialized research agents"
              : "Start a conversation to see the magic happen"}
          </p>
        </div>
      </div>
    );
  }

  // Active chat state
  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
    >
      <div className="max-w-3xl mx-auto space-y-5">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}

        {/* Typing indicator while waiting for response */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200 shadow-sm transition-colors duration-300 ${isDeepResearch ? "text-indigo-600" : "text-cyan-600"}`}
            >
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-1.5">
                <span
                  className={`w-2 h-2 rounded-full animate-bounce transition-colors duration-300 ${isDeepResearch ? "bg-indigo-400" : "bg-cyan-400"}`}
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className={`w-2 h-2 rounded-full animate-bounce transition-colors duration-300 ${isDeepResearch ? "bg-indigo-400" : "bg-cyan-400"}`}
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className={`w-2 h-2 rounded-full animate-bounce transition-colors duration-300 ${isDeepResearch ? "bg-indigo-400" : "bg-cyan-400"}`}
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
