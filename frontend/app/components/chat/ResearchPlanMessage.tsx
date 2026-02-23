"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotebookPen, ChevronDown, ChevronRight, Check, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Props {
  content: string;
  isAccepted: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ResearchPlanMessage({
  content,
  isAccepted,
  onAccept,
  onDecline,
}: Props) {
  const [isOpen, setIsOpen] = useState(!isAccepted);

  const handleAccept = () => {
    setIsOpen(false);
    onAccept();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex w-full justify-start"
    >
      <div className="w-full bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden">
        {/* Header Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-transparent"
          style={{ borderBottomColor: isOpen ? "#e2e8f0" : "transparent" }}
        >
          <div className="flex items-center gap-2 text-indigo-600 font-medium">
            <NotebookPen size={18} />
            <span>Research plan</span>
          </div>
          <div className="text-slate-400">
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </button>

        {/* Content */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 py-4">
                <div className="prose prose-sm prose-slate max-w-none w-full prose-p:leading-relaxed prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>

                {!isAccepted && (
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                    <button
                      onClick={handleAccept}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      <Check size={16} />
                      Accept
                    </button>
                    <button
                      onClick={onDecline}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <X size={16} />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
