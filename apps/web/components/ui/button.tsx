type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
};

export function Button({ children, onClick, variant = "primary", className = "" }: ButtonProps) {
  return (
    <button
      className={`${variant === "primary" ? "btn-primary" : "btn-secondary"} ${className}`}
      onClick={() => onClick && onClick()}
    >
      {children}
    </button>
  );
}