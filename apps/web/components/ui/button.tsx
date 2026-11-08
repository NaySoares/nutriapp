type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  disabled?: boolean;
  rest?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
};

export function Button({ children, onClick, variant = "primary", className = "", disabled, onKeyDown, ...rest}: ButtonProps) {
  return (
    <button
      className={`${variant === "primary" ? "btn-primary" : "btn-secondary"} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={() => onClick && onClick()}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}