"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useModalStore, type ModalEntry } from "../../../stores/modal-store";

function DefaultModal({
  modal,
  isTopModal,
  zIndex,
  onClose,
}: {
  modal: ModalEntry;
  isTopModal: boolean;
  zIndex: number;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
      style={{ zIndex }}
      aria-hidden={!isTopModal}
      onMouseDown={(event) => {
        if (
          isTopModal &&
          event.target === event.currentTarget &&
          modal.options.closeOnOverlay !== false
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal={isTopModal}
        aria-label={modal.options.title}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-4 shadow-xl"
        style={
          modal.options.width
            ? { width: modal.options.width, maxWidth: "100%" }
            : undefined
        }
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute right-4 top-4 rounded-lg p-2 hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        {modal.content}
      </div>
    </div>
  );
}

function SideModalView({
  modal,
  isTopModal,
  zIndex,
  onClose,
}: {
  modal: ModalEntry;
  isTopModal: boolean;
  zIndex: number;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50"
      style={{ zIndex }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      aria-hidden={!isTopModal}
      onMouseDown={(event) => {
        if (
          isTopModal &&
          event.target === event.currentTarget &&
          modal.options.closeOnOverlay !== false
        ) {
          onClose();
        }
      }}
    >
      <motion.div
        role="dialog"
        aria-modal={isTopModal}
        aria-label={modal.options.title}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{
          type: "tween",
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute right-0 top-0 flex h-dvh w-full flex-col rounded-s-xl bg-white shadow-xl sm:w-1/2 lg:w-1/3"
        style={
          modal.options.width
            ? { width: modal.options.width }
            : undefined
        }
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar painel"
          className="absolute right-4 top-4 z-10 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X size={20} />
        </button>

        <div className="h-full overflow-y-auto p-6">
          {modal.content}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ModalHost() {
  const modalStack = useModalStore((state) => state.modalStack);
  const closeModal = useModalStore((state) => state.closeModal);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (modalStack.length === 0) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalStack.length, closeModal]);

  if (!mounted || modalStack.length === 0) return null;

  return createPortal(
    <AnimatePresence initial={false}>
      {modalStack.map((modal, index) => {
        const isTopModal = index === modalStack.length - 1;
        const zIndex = 50 + index * 10;

        const props = {
          modal,
          isTopModal,
          zIndex,
          onClose: closeModal,
        };

        if (modal.type === "side") {
          return <SideModalView key={modal.id} {...props} />;
        }

        return <DefaultModal key={modal.id} {...props} />;
      })}
    </AnimatePresence>,
    document.body
  );
}