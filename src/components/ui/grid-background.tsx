interface GridBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function GridBackground({ children, className = '' }: GridBackgroundProps) {
  return <div className={`min-h-screen bg-[#f8f8f8] ${className}`}>{children}</div>;
}
