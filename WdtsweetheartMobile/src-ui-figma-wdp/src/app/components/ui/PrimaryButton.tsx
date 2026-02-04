import { ReactNode } from 'react';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function PrimaryButton({ 
  children, 
  onClick, 
  disabled = false,
  fullWidth = true 
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? 'w-full' : ''} bg-[#FF6262] text-white px-6 py-4 rounded-full font-medium shadow-lg shadow-[#FF6262]/30 hover:bg-[#ff4f4f] active:bg-[#e55555] disabled:bg-gray-300 disabled:shadow-none transition-all`}
    >
      {children}
    </button>
  );
}
