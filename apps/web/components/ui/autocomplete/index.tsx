"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { AutocompleteProps } from "./types";

export function Autocomplete<T>({
  value,
  onChange,
  onSelect,
  fetchSuggestions,
  getOptionLabel,
  getOptionValue,
  placeholder = "Digite para buscar...",
  minChars = 3,
  debounce = 300,
  emptyMessage = "Nenhum resultado encontrado.",
  loadingMessage = "Buscando...",
  required = false,
  disabled = false,
  className = "",
}: AutocompleteProps<T>) {
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(false);

  // render do dropdown
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // controle por teclado
  const [activeIndex, setActiveIndex] = useState(-1);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !inputRef.current) return;

    function updatePosition() {
      const rect = inputRef.current?.getBoundingClientRect();

      if (!rect) return;

      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    const term = value.trim();

    if (term.length < minChars) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      setLoading(true);
      setOpen(true);

      try {
        const results = await fetchSuggestions(term, controller.signal);

        if (!controller.signal.aborted) {
          setSuggestions(results);
          setActiveIndex(-1);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, debounce);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [value, minChars, debounce, fetchSuggestions]);


  useEffect(() => {
    if (activeIndex < 0) return;

    optionRefs.current[activeIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [activeIndex]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || selected) return;

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();

        if (suggestions.length === 0 || loading) return;

        setActiveIndex((current) =>
          current >= suggestions.length - 1 ? 0 : current + 1
        );

        break;
      }

      case "ArrowUp": {
        event.preventDefault();

        if (suggestions.length === 0 || loading) return;

        setActiveIndex((current) =>
          current <= 0 ? suggestions.length - 1 : current - 1
        );

        break;
      }

      case "Enter": {
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          event.preventDefault();
          handleSelect(suggestions[activeIndex]);
        }

        break;
      }

      case "Escape": {
        event.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
        break;
      }
    }
  }

  function handleSelect(option: T) {
    onSelect(option);
    onChange(getOptionLabel(option));
    setSuggestions([]);
    setOpen(false);
    setSelected(true);
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        onKeyDown={handleKeyDown}
        onChange={(event) => {
          setSelected(false);
          setActiveIndex(-1);
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (value.trim().length >= minChars) {
            setOpen(true);
          }
        }}
        onBlur={() => {
          setTimeout(() => {
            setOpen(false);
            setActiveIndex(-1);
          }, 200);
        }}
        className={`w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e] ${className} ${disabled ? "bg-[#f3f6f3] text-[#849188]" : ""}`}
      />

      {mounted &&
      open &&
      !selected &&
      createPortal(
        <div
          style={dropdownStyle}
          className="max-h-60 overflow-y-auto rounded-lg border border-[#e3eae4] bg-white shadow-lg"
        >
          {loading && (
            <p className="p-3 text-xs text-gray-500">
              {loadingMessage}
            </p>
          )}

          {!loading && suggestions.length === 0 && (
            <p className="p-3 text-xs text-gray-500">
              {emptyMessage}
            </p>
          )}

          {!loading &&
            suggestions.map((option, index) => (
              <button
                key={getOptionValue(option)}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSelect(option)}
                className={`w-full px-3 py-2.5 text-left text-xs ${
                  activeIndex === index
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                {getOptionLabel(option)}
              </button>
            ))}
        </div>,
        document.body
      )}
    </div>
  );
}