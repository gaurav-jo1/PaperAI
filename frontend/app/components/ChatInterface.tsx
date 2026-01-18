"use client";

import React, { useState } from "react";
import { Plus, ArrowRight, Atom, PanelRightOpen, Files } from "lucide-react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import FileCarousel from "./FileCarousel";

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const [isDeepThink, setIsDeepThink] = useState(false);

  const [selectedKnowledgeFiles, setSelectedKnowledgeFiles] = useState<
    string[]
  >([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarFullyClosed, setSidebarFullyClosed] = useState(false);
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="flex flex-row h-screen bg-white text-gray-900 selection:bg-gray-200 overflow-hidden">
      <div className="flex-1 flex flex-col h-full relative">
        {sidebarFullyClosed && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => {
                setSidebarFullyClosed(false);
                setIsSidebarOpen(true);
              }}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 "
              title="Open Sidebar"
            >
              <PanelRightOpen className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="relative w-32 h-32 mb-8 animate-in fade-in duration-700 ease-out slide-in-from-bottom-4">
            <Image
              src="/Crimson_logo_black.svg"
              alt="Crimson Logo"
              fill
              className="object-contain opacity-90"
              priority
            />
          </div>
        </div>

        <div className="w-full flex justify-center pb-8 px-4 mb-4 z-10">
          <div className="w-full max-w-3xl flex flex-col bg-gray-50 border border-gray-200 rounded-3xl shadow-sm focus-within:shadow-md transition-shadow duration-300">
            {selectedKnowledgeFiles.length > 0 && (
              <div className="pt-3 px-4 pb-0">
                <div className="inline-flex items-center gap-1.5 bg-linear-to-r from-purple-500 to-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                  <Files className="w-3.5 h-3.5" />
                  <span>
                    {selectedKnowledgeFiles.length}{" "}
                    {selectedKnowledgeFiles.length === 1 ? "file" : "files"}
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 pb-2">
              <textarea
                value={inputValue}
                onChange={handleInput}
                placeholder="Ask anything..."
                className="w-full max-h-48 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none text-base text-gray-900 placeholder:text-gray-400 outline-none"
                rows={1}
              />
            </div>

            <div className="px-3 pb-3 flex justify-between items-center">
              <button
                onClick={() => setIsDeepThink(!isDeepThink)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer border ${
                  isDeepThink
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-gray-500 border-gray-200 hover:bg-gray-200/50"
                }`}
              >
                <Atom className="w-3.5 h-3.5" />
                <span>Deep Think</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  disabled={!inputValue.trim()}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    inputValue.trim()
                      ? "bg-blue-700 text-white shadow-md hover:scale-105 active:scale-95"
                      : "bg-blue-400 text-white cursor-not-allowed"
                  }`}
                >
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence onExitComplete={() => setSidebarFullyClosed(true)}>
        {isSidebarOpen && (
          <FileCarousel
            selectedFileIds={selectedKnowledgeFiles}
            onSelectionChange={setSelectedKnowledgeFiles}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
