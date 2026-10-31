import { useEffect } from "react";

export function useKeyboardShortcut(
  key: string,
  callback: () => void
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // evita ativar o atalho quando o foco estiver em um input, textarea ou elemento editável
      const target = event.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (
        event.ctrlKey &&
        event.key.toLowerCase() === key.toLowerCase()
      ) {
        event.preventDefault();
        callback();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, callback]);
}