import { Phone } from "lucide-react";

type InputPhoneProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
};

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : "";
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
}

export function InputPhone({
  value = "",
  onChange,
  label = "Telefone",
  required = false,
  disabled = false,
  className = "",
  ...rest
}: InputPhoneProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
    onChange?.(digits);
  };

  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
        {label}
        {required && <span className="text-[#b65c50]"> *</span>}
      </span>

      <span className={`flex items-center gap-2 rounded-lg border border-[#e4eae4] px-3 ${
            disabled ? "bg-[#f3f6f3] text-[#849188]" : ""}`}>
        <Phone size={14} className="text-[#98a39b]" />
        <input
          {...rest}
          type="tel"
          inputMode="numeric"
          value={formatPhone(value)}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          maxLength={14}
          placeholder="(00) 0000-0000"
          className={`w-full py-2.5 text-xs outline-none focus:border-[#8ab69a] ${
            disabled ? "bg-[#f3f6f3] text-[#849188]" : ""
          } ${className}`}
        />
      </span>
    </label>
  );
}

InputPhone.displayName = "InputPhone";