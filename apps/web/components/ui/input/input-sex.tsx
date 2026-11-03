import { Sex, SEX_LABELS } from "@nutriapp/shared";

type InputSexProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange"
> & {
  value?: Sex;
  onChange?: (value: Sex) => void;
  label?: string;
};

export function InputSex({
  value,
  onChange,
  required = false,
  label = "Sexo",
  disabled = false,
  className = "",
  ...rest
}: InputSexProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value as "M" | "F";
    onChange?.(newValue);
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
        className={`w-full border border-[#e4eae4] rounded-lg px-3 py-2.5 text-xs outline-none focus:border-[#8ab69a] ${disabled ? "bg-[#f3f6f3] text-[#484c49]" : ""} ${className}`}
        style={{ minHeight: "42px" }}
        {...rest}
      >
        <option value="M">{SEX_LABELS.M}</option>
        <option value="F">{SEX_LABELS.F}</option>
      </select>
    </label>
  );
}

InputSex.displayName = "InputSex";