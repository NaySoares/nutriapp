import { HelpCircle } from "lucide-react";
import { Tooltip } from "../tooltip";

type InputTextProps = {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  helpText?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange">;

export function InputText({
  value = "",
  onChange,
  required = false,
  label,
  disabled = false,
  className = "",
  helpText,
  ...rest
}: InputTextProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <label className="block">
      {helpText ? (
        <Tooltip content={helpText} position="top">
          <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a] hover:cursor-help">
            {label}
            {required && <span className="text-[#b65c50]"> *</span>}
            <HelpCircle size={12} className="ml-1 inline-block text-[#53665a]" />
          </span>
        </Tooltip>
      ) : (
        <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
          {label}
          {required && <span className="text-[#b65c50]"> *</span>}
        </span>
      )}

      <input
        {...rest}
        type="text"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className={`w-full border border-[#e4eae4] rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#8ab69a] ${
          disabled ? "bg-[#f3f6f3] text-[#849188]" : ""
        } ${className}`}
      />
    </label>
  )
};

InputText.displayName = "InputText";