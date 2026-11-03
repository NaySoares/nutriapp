import { forwardRef } from "react";

type InputDateProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
};

export const InputDate = forwardRef<HTMLInputElement, InputDateProps>(
  (
    {
      value = "",
      onChange,
      required = false,
      label,
      disabled = false,
      className = "",
      ...rest
    },
    ref
  ) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.target.value);
    };

    return (
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
          {label}
          {required && <span className="text-[#b65c50]"> *</span>}
        </span>

        <input
          {...rest}
          ref={ref}
          type="date"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={`w-full border border-[#e4eae4] rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#8ab69a] ${
            disabled ? "bg-[#f3f6f3] text-[#849188]" : ""
          } ${className}`}
        />
      </label>
    );
  }
);

InputDate.displayName = "InputDate";