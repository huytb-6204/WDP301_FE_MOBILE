import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  originalPrice?: string;
  onAddToCart?: () => void;
  className?: string;
}

export function ProductCard({ image, name, price, originalPrice, onAddToCart, className }: ProductCardProps) {
  return (
    <div className={`bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all min-w-[260px] ${className ?? ''}`}>
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-[#FFF0F0]">
        <ImageWithFallback 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h4 className="text-[#102937] mb-2 line-clamp-1">
          {name}
        </h4>
        
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[#FF6262]" style={{ fontWeight: 600 }}>
            {price}
          </span>
          {originalPrice && (
            <span className="text-[#505050] text-sm line-through opacity-60">
              {originalPrice}
            </span>
          )}
        </div>
        
        {/* Add to cart button */}
        <button 
          onClick={onAddToCart}
          className="w-full bg-[#FF6262] text-white px-4 py-3 rounded-full font-medium text-sm shadow-md shadow-[#FF6262]/30 hover:bg-[#ff4f4f] active:bg-[#e55555] transition-all flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} />
          Thêm giỏ hàng
        </button>
      </div>
    </div>
  );
}
