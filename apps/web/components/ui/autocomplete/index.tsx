"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const term = value.trim();

    if (term.length < minChars) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
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
        value={value}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => {
          setSelected(false);
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
          }, 200);
        }}
        className={`w-full rounded-lg border border-[#e3eae4] px-3 py-2.5 text-[12px] outline-none focus:border-[#7fb18e] ${className} ${disabled ? "bg-[#f3f6f3] text-[#849188]" : ""}`}
      />

      {open && !selected && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-[#e3eae4] bg-white shadow-lg">
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

          {!loading && suggestions.map((option) => (
            <button
              key={getOptionValue(option)}
              type="button"
              onClick={() => handleSelect(option)}
              className="w-full px-3 py-2.5 text-left text-xs hover:bg-gray-50"
            >
              {getOptionLabel(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}