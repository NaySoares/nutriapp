"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useModalStore } from "../../stores/modal-store";

export default function Modal() {
  const { content, closeModal } = useModalStore();

  useEffect(() => {
    if (!content) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [content, closeModal]);

  if (!content) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl bg-white p-4 shadow-xl "
      >
        <button
          type="button"
          onClick={closeModal}
          aria-label="Fechar modal"
          className="absolute right-4 top-4 rounded-lg p-2 hover:bg-gray-1000"
        >
          <X size={20} className="hover:scale-150 transition-all duration-150" />
        </button>

        {content}
      </div>
    </div>
  );
}