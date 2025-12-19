import React from 'react';
import { playClick } from '../utils/audio';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
  disableSound?: boolean; // Optional prop to suppress default click sound if needed
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  disableSound = false,
}) => {
  const baseStyle = "font-bold rounded-2xl transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center";
  
  const variants = {
    primary: "bg-primary text-yellow-900 hover:bg-yellow-300 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1",
    secondary: "bg-secondary text-green-900 hover:bg-green-300 border-b-4 border-green-600 active:border-b-0 active:translate-y-1",
    accent: "bg-accent text-blue-900 hover:bg-blue-300 border-b-4 border-blue-600 active:border-b-0 active:translate-y-1",
    neutral: "bg-gray-100 text-gray-600 hover:bg-gray-200 border-b-4 border-gray-300 active:border-b-0 active:translate-y-1",
    outline: "bg-white border-2 border-primary text-primary hover:bg-yellow-50",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-4 text-xl",
    xl: "px-10 py-6 text-2xl w-full",
  };

  const disabledStyle = "opacity-50 cursor-not-allowed transform-none active:scale-100 border-b-4";

  const handleInteraction = (e: React.MouseEvent) => {
    if (disabled) return;
    
    if (!disableSound) {
      playClick();
    }
    
    onClick();
  };

  return (
    <button
      onClick={handleInteraction}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${disabled ? disabledStyle : ''} ${className}`}
    >
      {children}
    </button>
  );
};