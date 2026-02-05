import { ShoppingCart } from 'lucide-react';

interface FloatingCartButtonProps {
  itemCount?: number;
  onClick?: () => void;
}

export function FloatingCartButton({ itemCount = 0, onClick }: FloatingCartButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[#FF6262] to-[#FF9466] rounded-full shadow-2xl shadow-[#FF6262]/40 flex items-center justify-center active:scale-90 transition-all z-40"
    >
      <ShoppingCart size={24} className="text-white" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 w-7 h-7 bg-[#102937] text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
