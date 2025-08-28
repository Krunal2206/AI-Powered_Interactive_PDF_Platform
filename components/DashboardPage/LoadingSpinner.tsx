interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className={`p-8 min-h-screen ${className}`}>
      <div className="flex items-center justify-center h-64">
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-purple-500`}
        ></div>
      </div>
    </div>
  );
};
