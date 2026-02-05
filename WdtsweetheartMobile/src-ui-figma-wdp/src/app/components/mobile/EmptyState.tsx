interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  title = 'Không tìm thấy sản phẩm',
  message = 'Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác',
  actionLabel = 'Xóa bộ lọc',
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      {/* Illustration */}
      <div className="w-40 h-40 bg-gradient-to-br from-[#FFF0F0] to-[#FFF3E2] rounded-[32px] flex items-center justify-center mb-6 shadow-sm">
        <span className="text-7xl">🔍</span>
      </div>
      
      {/* Title */}
      <h3 className="text-[#102937] text-center mb-3">
        {title}
      </h3>
      
      {/* Message */}
      <p className="text-[#505050] text-center text-sm leading-relaxed mb-8 max-w-xs">
        {message}
      </p>
      
      {/* Action */}
      {onAction && (
        <button
          onClick={onAction}
          className="bg-[#FF6262] text-white px-8 py-4 rounded-full font-medium shadow-lg shadow-[#FF6262]/30 hover:bg-[#ff4f4f] active:scale-95 transition-all"
          style={{ minHeight: '44px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
