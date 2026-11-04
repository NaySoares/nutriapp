type InputCPFProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
};

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function InputCPF({
  value = "",
  onChange,
  label = "CPF",
  required = false,
  disabled = false,
  className = "",
  ...rest
}: InputCPFProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 11);
    onChange?.(digits);
  };

  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
        {label}
        {required && <span className="text-[#b65c50]"> *</span>}
      </span>

      <input
        {...rest}
        type="text"
        inputMode="numeric"
        value={formatCPF(value)}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        maxLength={14}
        placeholder="000.000.000-00"
        className={`w-full rounded-lg border border-[#e4eae4] px-3 py-2.5 text-xs outline-none focus:border-[#8ab69a] ${
          disabled ? "bg-[#f3f6f3] text-[#849188]" : ""
        } ${className}`}
      />
    </label>
  );
}

InputCPF.displayName = "InputCPF";