type InputSelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  options?: { value: string; label: string }[];
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange">;

export function InputSelect({
  value,
  onChange,
  required = false,
  label,
  disabled = false,
  className = "",
  options = [],
  ...rest
}: InputSelectProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
        {label}
        {required && <span className="text-[#b65c50]"> *</span>}
      </span>

      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className={`w-full border border-[#e4eae4] rounded-lg text-xs outline-none focus:border-[#8ab69a] ${
          disabled ? "bg-[#f3f6f3] text-[#484c49]" : ""
        } ${className}`}
        style={{ padding: "9px 11px", fontSize: "11px"}}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

InputSelect.displayName = "InputSelect";