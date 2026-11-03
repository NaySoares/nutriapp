export const ShortcutLabel = ({ label }: { label: string }) => {
  return (
    <kbd className="hidden rounded border text-nowrap border-[#9ba69e] bg-transparent px-1.5 py-0.5 text-[9px] text-[#9ba69e] md:inline">
      {label}
    </kbd>
  )
}