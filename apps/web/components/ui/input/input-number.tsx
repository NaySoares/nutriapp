type InputNumberProps = {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  unit?: string;
  step?: number;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange">;

export function InputNumber({
  value,
  onChange,
  placeholder,
  unit,
  step,
  disabled = false,
  label,
  required = false,
  className,
  ...rest
}: InputNumberProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const numericValue = newValue === "" ? 0 : Number(newValue);
    onChange(numericValue);
  };

  return (
     <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
        {label}
        {required && <span className="text-[#b65c50]"> *</span>}
      </span>
      <div className="relative">
        <input
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`w-full border border-[#e4eae4] rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#8ab69a] ${
          disabled ? "bg-[#f3f6f3] text-[#849188]" : ""
        } ${className}`}
          {...rest}
          style={{ padding: "9px 11px", fontSize: "11px"}}
        />
        <span className="pointer-events-none absolute right-3 top-2.5 text-[10px] text-[#849188]">
          {unit}
        </span>
      </div>
    </label>
  );
}