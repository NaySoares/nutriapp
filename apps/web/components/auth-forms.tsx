export function Field({ label, type = "text", name, required = true }: { label: string; type?: string; name: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input name={name} type={type} required={required} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
    </label>
  );
}