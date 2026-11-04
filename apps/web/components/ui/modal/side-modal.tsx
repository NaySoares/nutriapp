"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useModalStore } from "../../../stores/modal-store";

export function SideModal() {
  const { content, closeModal, type } = useModalStore();

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

  if (type !== "side") {
    return null;
  }

  if (!content) return null;

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          key="side-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/50"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "tween",
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute right-0 top-0 flex h-dvh w-full min-w-1/3 flex-col bg-white shadow-xl sm:w-1/2 lg:w-1/3 rounded-s-xl"
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="Fechar painel"
              className="absolute right-4 top-4 z-10 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <X size={20} />
            </button>

            <div className="h-full overflow-y-auto p-6">
              {content}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
