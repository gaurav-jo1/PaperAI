"use client";

import React, { useState, useRef, useEffect } from "react";
import { PanelRightOpen } from "lucide-react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

import FileCarousel from "./FileCarousel";
import { SelectedFilesBadge, DeepThinkButton, SendButton } from "./ui";
import { chatApi } from "@/app/services/api";

interface MessageBlock {
  type: string;
  text: string;
  extras?: {
    signature?: string;
  };
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string | MessageBlock[];
}

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const [isDeepThink, setIsDeepThink] = useState(false);
  const [selectedKnowledgeFiles, setSelectedKnowledgeFiles] = useState<
    string[]
  >([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarFullyClosed, setSidebarFullyClosed] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputValue;
    setInputValue("");

    // Reset textarea height
    const textarea = document.querySelector("textarea");
    if (textarea) textarea.style.height = "auto";

    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage({
        message: currentInput,
        knowledge_files: selectedKnowledgeFiles,
      });

      console.log(response);

      if (response && response.message) {
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: response.message[0].text,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openSidebar = () => {
    setSidebarFullyClosed(false);
    setIsSidebarOpen(true);
  };

  return (
    <div className="flex flex-row h-screen bg-white text-gray-900 selection:bg-gray-200 overflow-hidden">
      <div className="flex-1 flex flex-col h-full relative">
        {sidebarFullyClosed && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={openSidebar}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
              title="Open Sidebar"
            >
              <PanelRightOpen className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {messages.length === 0 ? (
            // Initial State with Logo
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
          ) : (
            // Chat Messages
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="max-w-3xl mx-auto flex flex-col gap-6 py-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "user" ? (
                      <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] text-gray-900">
                        <div className="whitespace-pre-wrap">
                          {msg.content as string}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full text-gray-900 pr-4">
                        <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-headings:font-medium">
                          <ReactMarkdown>{msg.content as string}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {/* Loading State */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="text-gray-400 text-sm animate-pulse ml-1">
                      Crimson thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="w-full flex justify-center pb-8 px-4 z-10 pt-2">
          <div className="w-full max-w-3xl flex flex-col bg-gray-50 border border-gray-200 rounded-3xl shadow-sm focus-within:shadow-md transition-shadow duration-300">
            <SelectedFilesBadge count={selectedKnowledgeFiles.length} />

            <div className="p-4 pb-2">
              <textarea
                value={inputValue}
                onChange={handleInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask anything..."
                className="w-full max-h-48 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none text-base text-gray-900 placeholder:text-gray-400 outline-none"
                rows={1}
              />
            </div>

            <div className="px-3 pb-3 flex justify-between items-center">
              <DeepThinkButton
                isActive={isDeepThink}
                onClick={() => setIsDeepThink(!isDeepThink)}
              />

              <div className="flex items-center gap-2">
                <SendButton
                  disabled={!inputValue.trim() || isLoading}
                  onClick={sendMessage}
                />
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
