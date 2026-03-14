import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Layers,
  Upload,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fileApi } from "@/app/lib/api";
import type { FileItem } from "@/app/types/file";

interface SidebarProps {
  files: FileItem[];
  isLoadingFiles: boolean;
  selectedDocIds: Set<string>;
  onToggleSelectDoc: (id: string) => void;
  onToggleSelectAll: () => void;
  onRefreshFiles: () => void;
}

export default function Sidebar({
  files,
  isLoadingFiles,
  selectedDocIds,
  onToggleSelectDoc,
  onToggleSelectAll,
  onRefreshFiles,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const totalTokens = files
    .filter((f) => selectedDocIds.has(f.file_id))
    .reduce((acc, curr) => acc + (curr.token_count || 0), 0);
  const tokenLimit = 100000;
  const tokenPercentage = (totalTokens / tokenLimit) * 100;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      setUploadStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus("idle");

    try {
      await fileApi.uploadFiles(selectedFiles);
      setUploadStatus("success");
      setSelectedFiles([]);
      onRefreshFiles();
      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setUploadStatus("idle");
  };

  return (
    <motion.div
      initial={{ width: 270 }}
      animate={{ width: isOpen ? 270 : 64 }} // w-64 vs w-16
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

      {/* Navigation / Actions */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto py-4">
          {/* Upload Section */}
          <div className="px-3 mb-6">
            <input
              type="file"
              multiple
              accept=".pdf"
              className="hidden"
              id="file-upload"
              onChange={handleFileSelect}
            />

            <label
              htmlFor="file-upload"
              className={`flex items-center ${
                isOpen ? "px-4" : "justify-center"
              } py-3 cursor-pointer hover:bg-cyan-100/50 rounded-xl transition-all group border border-dashed border-cyan-200 hover:border-cyan-400 bg-white/50`}
            >
              <div
                className={`p-2 rounded-lg bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100 transition-colors`}
              >
                <Upload size={20} />
              </div>

              {isOpen && (
                <div className="ml-3">
                  <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                    Upload Files
                  </p>
                  <p className="text-xs whitespace-nowrap text-slate-500">
                    PDFs only
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Selected Files Preview */}
          <AnimatePresence>
            {isOpen && selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 mb-6 overflow-hidden"
              >
                <div className="bg-white rounded-xl border border-cyan-100 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-cyan-600" />
                      <span className="text-sm font-medium text-slate-700">
                        {selectedFiles.length} file
                        {selectedFiles.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <button
                      onClick={clearSelection}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <span>Confirm Upload</span>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Messages */}
          <AnimatePresence>
            {isOpen && uploadStatus !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`mx-4 mb-6 p-3 rounded-lg flex items-center space-x-2 text-sm ${
                  uploadStatus === "success"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}
              >
                {uploadStatus === "success" ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>
                  {uploadStatus === "success"
                    ? "Files uploaded successfully!"
                    : "Failed to upload files."}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Your Files Section */}
          <div className="px-3">
            <div
              className={`mb-4 px-4 flex items-center justify-between text-slate-500 ${!isOpen && "justify-center"}`}
            >
              {isOpen ? (
                <div className="flex items-center space-x-2">
                  <Layers size={16} />
                  <p className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                    Your Files
                  </p>
                </div>
              ) : (
                <div className="h-px w-8 bg-slate-200" />
              )}

              {isOpen && files.length > 0 && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      files.length > 0 && selectedDocIds.size === files.length
                    }
                    onChange={onToggleSelectAll}
                    className="w-4 h-4 text-cyan-600 bg-slate-100 border-slate-300 rounded focus:ring-cyan-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1">
              {isLoadingFiles ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <Loader2 size={16} className="text-cyan-600 animate-spin" />
                  {isOpen && (
                    <span className="text-xs text-slate-400">
                      Loading files...
                    </span>
                  )}
                </div>
              ) : files.length === 0 ? (
                isOpen && (
                  <div className="text-center py-4 text-slate-400 text-sm">
                    No files yet
                  </div>
                )
              ) : (
                files.map((file) => (
                  <div
                    key={file.file_id}
                    onClick={() => onToggleSelectDoc(file.file_id)}
                    className={`group flex items-center ${
                      isOpen ? "px-4" : "justify-center"
                    } py-2.5 rounded-lg border border-transparent transition-all cursor-pointer ${
                      selectedDocIds.has(file.file_id)
                        ? "bg-[#0078D4] border-[#0078D4] shadow-md"
                        : "hover:bg-slate-100 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`min-w-[20px] ${selectedDocIds.has(file.file_id) ? "text-white" : "text-slate-400 group-hover:text-sky-600"} transition-colors`}
                    >
                      <FileText size={18} />
                    </div>
                    {isOpen && (
                      <div className="ml-3 overflow-hidden flex-1">
                        <p
                          className={`text-sm font-medium truncate transition-colors whitespace-nowrap ${selectedDocIds.has(file.file_id) ? "text-white" : "text-slate-600 group-hover:text-slate-900"}`}
                        >
                          {file.file_name}
                        </p>
                        <p
                          className={`text-[10px] whitespace-nowrap ${selectedDocIds.has(file.file_id) ? "text-slate-50" : "text-slate-400 group-hover:text-slate-500"} transition-colors`}
                        >
                          {file.number_of_pages} pages •{" "}
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Context Window Indicator */}
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 border-t border-cyan-100 bg-white/80 backdrop-blur-xl shrink-0 relative z-10 overflow-hidden group"
        >
          {/* Subtle grid background for Sci-Fi feel */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-size[10px_10px] pointer-events-none" />

          <div className="flex justify-between items-end mb-3 relative">
            <div className="text-left pb-0.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-600/70 mb-1 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 animate-pulse"></span>
                Context Core
              </p>
              <p className="text-[11px] font-semibold text-slate-600 font-mono tracking-tight mt-1">
                {(totalTokens / 1000).toFixed(1)}k{" "}
                <span className="text-slate-300">/</span>{" "}
                {(tokenLimit / 1000).toFixed(0)}k
              </p>
              <p className="text-[8px] uppercase tracking-widest text-slate-400 mt-1">
                Tokens Used
              </p>
            </div>

            <div className="flex items-baseline space-x-1 text-right">
              <span
                className={`text-4xl font-black tracking-tighter ${
                  tokenPercentage > 90
                    ? "text-red-500"
                    : tokenPercentage > 75
                      ? "text-amber-500"
                      : "text-cyan-500"
                }`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {tokenPercentage.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-cyan-600/40">%</span>
            </div>
          </div>

          <div className="w-full bg-slate-900/5 h-1.5 rounded-full overflow-hidden relative backdrop-blur-sm">
            {/* Segmented grid over the bar */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.7)_50%,transparent_100%)] bg-size[10px_10px] z-10 mix-blend-overlay opacity-30" />

            <motion.div
              className={`h-full relative overflow-hidden ${
                tokenPercentage > 100
                  ? "bg-red-500"
                  : tokenPercentage > 90
                    ? "bg-rose-500"
                    : tokenPercentage > 75
                      ? "bg-amber-500"
                      : "bg-cyan-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(tokenPercentage, 100)}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Energy pulse effect */}
              <motion.div
                className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-r from-transparent to-white opacity-40 blur-[1px]"
                animate={{
                  x: ["-100%", "200%"],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  repeatDelay: 0.5,
                }}
              />
            </motion.div>
          </div>
          <AnimatePresence>
            {tokenPercentage >= 100 && (
              <motion.p
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="text-[10px] text-red-500 font-bold uppercase tracking-wider flex items-center justify-center bg-red-50/80 py-1.5 rounded border border-red-200/50 mt-3"
              >
                <AlertCircle size={12} className="mr-1.5 animate-pulse" />
                Capacity Exceeded
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div
          className="p-4 border-t border-cyan-100 bg-white/40 shrink-0 flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-50 transition-colors"
          onClick={toggleSidebar}
          title={`${totalTokens.toLocaleString()} / ${tokenLimit.toLocaleString()} tokens`}
        >
          <div className="w-1.5 h-12 bg-slate-200/60 rounded-full overflow-hidden shadow-inner relative flex items-end">
            <motion.div
              className={`w-full rounded-full relative overflow-hidden ${
                tokenPercentage > 100
                  ? "bg-linear-to-r from-red-600 to-red-800"
                  : tokenPercentage > 90
                    ? "bg-linear-to-r from-red-500 to-rose-600"
                    : tokenPercentage > 75
                      ? "bg-linear-to-r from-amber-400 to-orange-500"
                      : "bg-linear-to-r from-cyan-400 to-blue-500"
              }`}
              initial={{ height: 0 }}
              animate={{ height: `${Math.min(tokenPercentage, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 w-full h-full bg-linear-to-b from-transparent via-white/40 to-transparent"
                initial={{ y: "100%" }}
                animate={{ y: "-100%" }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
