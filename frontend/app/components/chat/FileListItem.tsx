"use client";

import { FileText, CheckSquare, Square } from "lucide-react";
import type { FileItem } from "@/app/types";

interface FileListItemProps {
  file: FileItem;
  isSelected: boolean;
  onSelect: () => void;
}

export default function FileListItem({
  file,
  isSelected,
  onSelect,
}: FileListItemProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${
        isSelected ? "bg-blue-50/30" : ""
      }`}
      onClick={onSelect}
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
}
