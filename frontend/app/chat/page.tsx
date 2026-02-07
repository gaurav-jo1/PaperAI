"use client";

import Sidebar from "@/app/components/chat/Sidebar";
import { Send } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="w-full max-w-2xl flex flex-col items-center animate-in fade-in zoom-in duration-500 relative z-10">
          {/* 1. Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter">
              <span className="bg-linear-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                PaperAI
              </span>
            </h1>
          </div>

          {/* 2. Input Bar */}
          <div className="w-full relative group max-w-xl mb-3">
            <div className="absolute inset-0 bg-linear-to-r from-cyan-400 to-blue-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            <div className="relative flex items-center bg-white/80 backdrop-blur-sm border border-cyan-100 rounded-full shadow-sm hover:shadow-md transition-all duration-200">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="w-full py-3 pl-6 pr-14 text-sm bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-800 placeholder:text-slate-400"
              />
              <button className="absolute right-2 p-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:opacity-90 transition-opacity shadow-sm">
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* 3. Subtext */}
          <p className="text-slate-400 text-xs font-medium text-center animate-pulse tracking-wide">
            Start a conversation to see the magic happen
          </p>
        </div>
      </main>
    </div>
  );
}
