"use client";

import { X } from "lucide-react";

export function ErrorBannerInput({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="rounded-md border border-red-500 bg-white">
      <div className="flex items-center justify-between px-3 py-2.5 text-sm text-red-700">
        <span className="truncate">{message}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="p-1 rounded hover:bg-red-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
