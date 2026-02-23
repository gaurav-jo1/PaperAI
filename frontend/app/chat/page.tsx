"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/chat/Sidebar";
import ChatArea from "@/app/components/chat/ChatArea";
import ChatInput from "@/app/components/chat/ChatInput";
import { fileApi, chatApi, researchApi } from "@/app/lib/api";
import type { FileItem } from "@/app/types/file";
import type { Message } from "@/app/components/chat/ChatArea";

export default function ChatPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepResearch, setIsDeepResearch] = useState(false);
  const [loadingText, setLoadingText] = useState<string | undefined>();

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
      setSelectedDocIds(new Set(files.map((f) => f.file_id)));
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

  const handleSend = async (message: string) => {
    // Append user message immediately
    const userMsgId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: message },
    ]);
    setIsLoading(true);
    setLoadingText(
      isDeepResearch
        ? "Analyzing query and generating structured research plan…"
        : undefined,
    );

    try {
      let response: any;
      if (isDeepResearch) {
        response = await researchApi.getResearchPlan({
          message,
          knowledge_files: Array.from(selectedDocIds),
        });

        const planContent =
          response.plan || response.message || JSON.stringify(response);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: planContent,
            isResearchPlan: true,
            planAccepted: false,
          },
        ]);
      } else {
        response = await chatApi.sendMessage({
          message,
          knowledge_files: Array.from(selectedDocIds),
        });

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: response.message,
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setLoadingText(undefined);
    }
  };

  const handleAcceptPlan = async (msg: Message) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, planAccepted: true } : m)),
    );

    setLoadingText(undefined);
    setIsLoading(true);

    try {
      const response = await researchApi.getResearchExecute({
        plan: msg.content,
        knowledge_files: Array.from(selectedDocIds),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.message,
        },
      ]);
    } catch (error) {
      console.error("Execution error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Failed to execute research plan. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclinePlan = (msg: Message) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Research plan declined by user.",
      },
    ]);
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
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <ChatArea
          messages={messages}
          isLoading={isLoading}
          isDeepResearch={isDeepResearch}
          loadingText={loadingText}
          onAcceptPlan={handleAcceptPlan}
          onDeclinePlan={handleDeclinePlan}
        />

        {/* Bottom Input */}
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          selectedDocIds={selectedDocIds}
          isDeepResearch={isDeepResearch}
          onToggleDeepResearch={() => setIsDeepResearch(!isDeepResearch)}
        />
      </main>
    </div>
  );
}
