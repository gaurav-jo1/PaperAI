"use client";

import { Atom } from "lucide-react";

interface DeepThinkButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export default function DeepThinkButton({
  isActive,
  onClick,
}: DeepThinkButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer border ${
        isActive
          ? "bg-blue-600 text-white border-blue-600"
          : "text-gray-500 border-gray-200 hover:bg-gray-200/50"
      }`}
    >
      <Atom className="w-3.5 h-3.5" />
      <span>Deep Think</span>
    </button>
  );
}
