export type AutocompleteProps<T> = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: T) => void;

  fetchSuggestions: (query: string, signal: AbortSignal) => Promise<T[]>;

  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;

  placeholder?: string;
  minChars?: number;
  debounce?: number;
  emptyMessage?: string;
  loadingMessage?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};