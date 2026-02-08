"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/chat/Sidebar";
import { Send, FileText } from "lucide-react";
import { fileApi } from "@/app/lib/api";
import type { FileItem } from "@/app/types/file";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

  const fetchFiles = async () => {
    try {
      const data = await fileApi.getFiles();
      setFiles(data);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const toggleSelectAll = () => {
    if (selectedDocIds.size === files.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(files.map((f) => f.id)));
    }
  };

  const toggleSelectDoc = (id: string) => {
    const newSelected = new Set(selectedDocIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDocIds(newSelected);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        files={files}
        isLoadingFiles={isLoadingFiles}
        selectedDocIds={selectedDocIds}
        onToggleSelectDoc={toggleSelectDoc}
        onToggleSelectAll={toggleSelectAll}
        onRefreshFiles={fetchFiles}
      />

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
                className="w-full py-3 pl-6 pr-32 text-sm bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-800 placeholder:text-slate-400"
              />

              {/* Selection Badge inside Input */}
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

              <button className="absolute right-2 p-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:opacity-90 transition-opacity shadow-sm cursor-pointer z-10">
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
