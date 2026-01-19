"use client";

import { ArrowRight } from "lucide-react";

interface SendButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export default function SendButton({ disabled, onClick }: SendButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`p-2 rounded-full transition-all duration-200 ${
        !disabled
          ? "bg-blue-700 text-white shadow-md hover:scale-105 active:scale-95"
          : "bg-blue-400 text-white cursor-not-allowed"
      }`}
    >
      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
    </button>
  );
}
