import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "white" | "gray";
  text?: string;
}

function LoadingSpinner({ size = "md", color = "blue", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const colorClasses = {
    blue: "border-blue-600 border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-gray-600 border-t-transparent"
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <motion.div
        className={`${sizeClasses[size]} border-2 rounded-full ${colorClasses[color]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && (
        <span className="text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
}

export function LoadingOverlay({ isVisible, text = "Cargando..." }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <span className="text-gray-700 font-medium">{text}</span>
      </div>
    </motion.div>
  );
}

interface LoadingButtonProps {
  onClick: () => void;
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loadingText?: string;
}

export function LoadingButton({ 
  onClick, 
  loading, 
  children, 
  className = "", 
  disabled = false,
  loadingText
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`flex items-center justify-center gap-2 ${className} ${
        loading || disabled ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {loading && <LoadingSpinner size="sm" color="white" />}
      {loading ? (loadingText || "Cargando...") : children}
    </button>
  );
}

export default LoadingSpinner;