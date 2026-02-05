import { useState } from 'react';
import { X } from 'lucide-react';

interface FilterSidebarProps {
  onApplyFilter?: (filters: FilterState) => void;
  onClearFilter?: () => void;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  inStock: boolean;
  sortBy: string;
}

export function FilterSidebar({ onApplyFilter, onClearFilter }: FilterSidebarProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [inStock, setInStock] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { id: 'dog', label: 'Chó cưng', icon: '🐕' },
    { id: 'cat', label: 'Mèo cưng', icon: '🐱' },
    { id: 'food', label: 'Đồ ăn', icon: '🍖' },
    { id: 'accessories', label: 'Phụ kiện', icon: '🎀' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price-low', label: 'Giá thấp đến cao' },
    { value: 'price-high', label: 'Giá cao đến thấp' },
    { value: 'best-selling', label: 'Bán chạy' }
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleApplyFilter = () => {
    onApplyFilter?.({
      categories: selectedCategories,
      priceRange,
      inStock,
      sortBy
    });
  };

  const handleClearFilter = () => {
    setSelectedCategories([]);
    setPriceRange([0, 5000000]);
    setInStock(true);
    setSortBy('newest');
    onClearFilter?.();
  };

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[rgba(0,0,0,0.05)] sticky top-24">
      <h3 className="text-[#102937] mb-6">
        Bộ lọc
      </h3>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="text-[#505050] mb-3 text-sm font-medium">
          Danh mục
        </h4>
        <div className="space-y-2">
          {categories.map(category => (
            <label
              key={category.id}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#FFF0F0] cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className="w-5 h-5 rounded-lg border-2 border-[#FF6262] text-[#FF6262] focus:ring-[#FF6262] focus:ring-offset-0"
              />
              <span className="text-xl">{category.icon}</span>
              <span className="text-[#505050] text-sm">{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-[#505050] mb-3 text-sm font-medium">
          Khoảng giá
        </h4>
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="5000000"
            step="100000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full h-2 bg-[#FFF0F0] rounded-full appearance-none cursor-pointer 
              [&::-webkit-slider-thumb]:appearance-none 
              [&::-webkit-slider-thumb]:w-5 
              [&::-webkit-slider-thumb]:h-5 
              [&::-webkit-slider-thumb]:rounded-full 
              [&::-webkit-slider-thumb]:bg-[#FF6262] 
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-moz-range-thumb]:w-5 
              [&::-moz-range-thumb]:h-5 
              [&::-moz-range-thumb]:rounded-full 
              [&::-moz-range-thumb]:bg-[#FF6262] 
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:shadow-lg"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[#505050] text-xs">0đ</span>
            <span className="text-[#FF6262] text-sm font-medium">
              {priceRange[1].toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>
      </div>

      {/* Stock Status */}
      <div className="mb-6">
        <label className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#FFF0F0] cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="w-5 h-5 rounded-lg border-2 border-[#FF6262] text-[#FF6262] focus:ring-[#FF6262] focus:ring-offset-0"
          />
          <span className="text-[#505050] text-sm">Chỉ hiện sản phẩm còn hàng</span>
        </label>
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <h4 className="text-[#505050] mb-3 text-sm font-medium">
          Sắp xếp theo
        </h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-4 py-3 bg-[#f3f3f5] rounded-full text-sm text-[#505050] focus:outline-none focus:ring-2 focus:ring-[#FF6262]/20 border-none"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleApplyFilter}
          className="w-full bg-[#FF6262] text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-[#FF6262]/30 hover:bg-[#ff4f4f] active:bg-[#e55555] transition-all"
        >
          Áp dụng
        </button>
        <button
          onClick={handleClearFilter}
          className="w-full bg-transparent border-2 border-[#FF6262] text-[#FF6262] px-6 py-3 rounded-full font-medium hover:bg-[#FF6262]/5 active:bg-[#FF6262]/10 transition-all"
        >
          Xóa lọc
        </button>
      </div>
    </div>
  );
}