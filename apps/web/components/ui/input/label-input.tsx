type LabelInputProps = {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
};

export function LabelInput({ label, required, children }: LabelInputProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#53665a]">
        {label}
        {required && <span className="text-[#b65c50]"> *</span>}
      </span>

      {children}
    </label>
  )
};