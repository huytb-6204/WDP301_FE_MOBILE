import { ReactNode } from 'react';

interface SocialButtonProps {
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

export function SocialButton({ icon, children, onClick }: SocialButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white border-2 border-gray-200 text-[#505050] px-6 py-3.5 rounded-2xl font-medium flex items-center justify-center gap-3 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-all"
    >
      {icon}
      {children}
    </button>
  );
}
