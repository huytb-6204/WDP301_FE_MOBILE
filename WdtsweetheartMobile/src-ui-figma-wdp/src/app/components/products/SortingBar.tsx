import { Grid3x3, List, ChevronDown } from 'lucide-react';

interface SortingBarProps {
  totalProducts: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function SortingBar({ 
  totalProducts, 
  viewMode, 
  onViewModeChange, 
  sortBy, 
  onSortChange 
}: SortingBarProps) {
  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price-low', label: 'Giá thấp đến cao' },
    { value: 'price-high', label: 'Giá cao đến thấp' },
    { value: 'best-selling', label: 'Bán chạy' }
  ];

  return (
    <div className="bg-white rounded-[24px] p-4 shadow-sm border border-[rgba(0,0,0,0.05)] mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Product Count */}
        <div className="text-[#505050] text-sm">
          Hiển thị <span className="text-[#FF6262] font-medium">{totalProducts}</span> sản phẩm
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-[#FFF0F0] text-[#505050] px-4 py-2 pr-10 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6262]/20 cursor-pointer"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown 
              size={16} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#505050] pointer-events-none" 
            />
          </div>

          {/* View Toggle - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-1 bg-[#FFF0F0] rounded-full p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-full transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#FF6262] text-white shadow-md'
                  : 'text-[#505050] hover:text-[#FF6262]'
              }`}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-full transition-all ${
                viewMode === 'list'
                  ? 'bg-[#FF6262] text-white shadow-md'
                  : 'text-[#505050] hover:text-[#FF6262]'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
