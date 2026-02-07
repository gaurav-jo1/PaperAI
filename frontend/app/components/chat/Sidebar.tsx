"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  SquarePen,
  Layers,
  History,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFilesOpen, setIsFilesOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setIsHistoryOpen(false);
    setIsFilesOpen(false);
  };
  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
    setIsOpen(true);
  };
  const toggleFiles = () => {
    setIsFilesOpen(!isFilesOpen);
    setIsOpen(true);
  };

  return (
    <motion.div
      initial={{ width: 256 }}
      animate={{ width: isOpen ? 256 : 64 }} // w-64 vs w-16
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-slate-50 border-r border-cyan-100 flex flex-col overflow-hidden relative shadow-sm"
    >
      {/* Header */}
      <div
        className={`flex items-center p-4 ${isOpen ? "justify-between" : "justify-center"}`}
      >
        {isOpen && (
          <Link
            href="/"
            className="font-bold text-xl tracking-tight bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"
          >
            PaperAI
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 text-cyan-700 hover:bg-cyan-100/50 cursor-pointer rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Add new Chat */}
      <div className="px-4 py-2">
        <button className="flex items-center gap-3 w-full p-2 text-cyan-700 hover:bg-cyan-100/50 cursor-pointer rounded-lg transition-colors group">
          <SquarePen size={20} />
          {isOpen && <span className="font-medium text-nowrap">New Chat</span>}
        </button>
      </div>

      {/* Files */}
      <div className="px-4 py-2">
        <button
          onClick={toggleFiles}
          className="flex items-center gap-3 w-full p-2 text-cyan-700 hover:bg-cyan-100/50 cursor-pointer rounded-lg transition-colors group"
        >
          <div className="relative flex items-center justify-center w-5 h-5">
            <Layers
              size={20}
              className={`absolute transition-opacity duration-200 ${
                isFilesOpen ? "opacity-0" : "opacity-100 group-hover:opacity-0"
              }`}
            />
            <ChevronRight
              size={20}
              className={`absolute transition-opacity duration-200 opacity-0 ${
                !isFilesOpen && "group-hover:opacity-100"
              }`}
            />
            <ChevronDown
              size={20}
              className={`absolute transition-opacity duration-200 ${
                isFilesOpen ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
          {isOpen && <span className="font-medium text-nowrap">Files</span>}
        </button>

        <AnimatePresence>
          {isFilesOpen && isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden ml-9"
            >
              <div className="py-2 text-sm text-gray-600">
                {/* File Dropdown Content */}
                <p>No files uploaded</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat History */}
      <div className="px-4 py-2">
        <button
          onClick={toggleHistory}
          className="flex items-center gap-3 w-full p-2 text-cyan-700 hover:bg-cyan-100/50 cursor-pointer rounded-lg transition-colors group"
        >
          <div className="relative flex items-center justify-center w-5 h-5">
            <History
              size={20}
              className={`absolute transition-opacity duration-200 ${
                isHistoryOpen
                  ? "opacity-0"
                  : "opacity-100 group-hover:opacity-0"
              }`}
            />
            <ChevronRight
              size={20}
              className={`absolute transition-opacity duration-200 opacity-0 ${
                !isHistoryOpen && "group-hover:opacity-100"
              }`}
            />
            <ChevronDown
              size={20}
              className={`absolute transition-opacity duration-200 ${
                isHistoryOpen ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
          {isOpen && (
            <span className="font-medium text-nowrap">Chat History</span>
          )}
        </button>

        <AnimatePresence>
          {isHistoryOpen && isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden ml-9"
            >
              <div className="py-2 text-sm text-gray-600">
                {/* History Dropdown Content */}
                <p className="text-nowrap">No recent history</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
