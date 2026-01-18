"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Folder,
  FileText,
  Upload,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronDown,
  PanelRightClose,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileItem {
  file_id: string;
  number_of_pages: number;
  file_name: string;
  user_id: string;
  id: string;
  created_at: string;
}

interface FileCarouselProps {
  selectedFileIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onClose: () => void;
}

export default function FileCarousel({
  selectedFileIds,
  onSelectionChange,
  onClose,
}: FileCarouselProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/data/files");
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const uploadPromises = Array.from(e.target.files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return axios.post("http://127.0.0.1:8000/data/files", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      });

      await Promise.all(uploadPromises);
      await fetchFiles();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload some files");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectAll = () => {
    if (selectedFileIds.length === files.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(files.map((f) => f.file_id));
    }
  };

  const handleSelectOne = (fileId: string) => {
    if (selectedFileIds.includes(fileId)) {
      onSelectionChange(selectedFileIds.filter((id) => id !== fileId));
    } else {
      onSelectionChange([...selectedFileIds, fileId]);
    }
  };

  const isAllSelected =
    files.length > 0 && selectedFileIds.length === files.length;

  const sortedFiles = [...files].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-80 h-full border-l border-gray-200 bg-gray-50 flex flex-col"
    >
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Documents</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          title="Close Sidebar"
        >
          <PanelRightClose className="w-5 h-5" />
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        multiple
      />

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex justify-center items-center h-20 text-gray-400 text-sm">
            Loading files...
          </div>
        ) : (
          <div className="space-y-1">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div
                className="flex items-center gap-2 p-3 bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <Folder className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                  The 48 Laws of Power
                </span>

                <div
                  className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAll();
                  }}
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="border-t border-gray-100 overflow-hidden"
                  >
                    <div className="px-3 py-2 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                      <button
                        onClick={handleTriggerUpload}
                        disabled={uploading}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        <Plus
                          className={`w-3.5 h-3.5 ${uploading ? "animate-spin" : ""}`}
                        />
                        <span>
                          {uploading ? "Uploading files..." : "Add document"}
                        </span>
                      </button>

                      <div className="flex items-center gap-1 bg-gray-200/50 p-0.5 rounded-md">
                        <button
                          onClick={() => setSortOrder("newest")}
                          className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all cursor-pointer ${
                            sortOrder === "newest"
                              ? "bg-white text-gray-800 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          Newest
                        </button>
                        <button
                          onClick={() => setSortOrder("oldest")}
                          className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all cursor-pointer ${
                            sortOrder === "oldest"
                              ? "bg-white text-gray-800 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          Oldest
                        </button>
                      </div>
                    </div>

                    {sortedFiles.map((file) => {
                      const isSelected = selectedFileIds.includes(file.file_id);
                      return (
                        <div
                          key={file.file_id}
                          className={`flex items-center gap-3 p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${
                            isSelected ? "bg-blue-50/30" : ""
                          }`}
                          onClick={() => handleSelectOne(file.file_id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                              <p className="text-sm text-gray-700 font-medium truncate">
                                {file.file_name}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 pl-6">
                              {file.number_of_pages} pages
                            </p>
                          </div>
                          <div className="p-1">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-300" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {files.length === 0 && (
                      <div className="p-4 text-center text-xs text-gray-400">
                        No files found
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
