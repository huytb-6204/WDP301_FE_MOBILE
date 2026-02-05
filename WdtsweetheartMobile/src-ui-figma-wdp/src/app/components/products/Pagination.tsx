import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5; // Number of page buttons to show
    
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    
    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#FF6262] text-[#FF6262] hover:bg-[#FF6262] hover:text-white disabled:border-gray-300 disabled:text-gray-300 disabled:hover:bg-transparent transition-all"
      >
        <ChevronLeft size={20} />
      </button>

      {/* First Page */}
      {getPageNumbers()[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#505050] hover:bg-[#FFF0F0] transition-all"
          >
            1
          </button>
          {getPageNumbers()[0] > 2 && (
            <span className="text-[#505050] px-2">...</span>
          )}
        </>
      )}

      {/* Page Numbers */}
      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-all ${
            currentPage === page
              ? 'bg-[#FF6262] text-white shadow-lg shadow-[#FF6262]/30'
              : 'text-[#505050] hover:bg-[#FFF0F0]'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Last Page */}
      {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
        <>
          {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
            <span className="text-[#505050] px-2">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#505050] hover:bg-[#FFF0F0] transition-all"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#FF6262] text-[#FF6262] hover:bg-[#FF6262] hover:text-white disabled:border-gray-300 disabled:text-gray-300 disabled:hover:bg-transparent transition-all"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
