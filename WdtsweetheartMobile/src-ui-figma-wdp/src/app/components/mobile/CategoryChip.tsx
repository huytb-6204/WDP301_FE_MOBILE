interface CategoryChipProps {
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}

export function CategoryChip({ label, icon, active = false, onClick }: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium text-sm whitespace-nowrap transition-all active:scale-95 ${
        active
          ? 'bg-[#FF6262] text-white shadow-lg shadow-[#FF6262]/30'
          : 'bg-[#FFF0F0] text-[#505050] hover:bg-[#FFE5E5]'
      }`}
      style={{ minHeight: '44px' }}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
