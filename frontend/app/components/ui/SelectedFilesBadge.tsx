"use client";

import { Files } from "lucide-react";

interface SelectedFilesBadgeProps {
  count: number;
}

export default function SelectedFilesBadge({ count }: SelectedFilesBadgeProps) {
  if (count === 0) return null;

  return (
    <div className="pt-3 px-4 pb-0">
      <div className="inline-flex items-center gap-1.5 bg-linear-to-r from-purple-500 to-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
        <Files className="w-3.5 h-3.5" />
        <span>
          {count} {count === 1 ? "file" : "files"}
        </span>
      </div>
    </div>
  );
}
