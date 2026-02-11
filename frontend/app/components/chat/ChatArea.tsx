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
}

export default function ChatArea({ messages, isLoading }: ChatAreaProps) {
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
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter">
              <span className="bg-linear-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                PaperAI
              </span>
            </h1>
          </div>

          {/* Subtext */}
          <p className="text-slate-400 text-xs font-medium text-center animate-pulse tracking-wide">
            Start a conversation to see the magic happen
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
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200 text-cyan-600 shadow-sm">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-1.5">
                <span
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
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
