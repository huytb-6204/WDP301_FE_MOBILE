import { ReactNode } from 'react';

interface SecondaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
}

export function SecondaryButton({ 
  children, 
  onClick,
  fullWidth = true 
}: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${fullWidth ? 'w-full' : ''} bg-transparent border-2 border-[#FF6262] text-[#FF6262] px-6 py-4 rounded-full font-medium hover:bg-[#FF6262]/5 active:bg-[#FF6262]/10 transition-all`}
    >
      {children}
    </button>
  );
}
