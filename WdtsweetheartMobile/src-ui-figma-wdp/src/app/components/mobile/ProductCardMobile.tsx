import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ShoppingCart, Star } from 'lucide-react';

interface ProductCardMobileProps {
  image: string;
  name: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  rating?: number;
  inStock?: boolean;
  onAddToCart?: () => void;
  onPress?: () => void;
}

export function ProductCardMobile({ 
  image, 
  name, 
  price, 
  originalPrice, 
  badge,
  rating = 4.5,
  inStock = true,
  onAddToCart,
  onPress
}: ProductCardMobileProps) {
  return (
    <div 
      onClick={onPress}
      className="bg-white rounded-[20px] overflow-hidden shadow-sm active:shadow-lg transition-all border-2 border-transparent active:border-[#FF6262]/20 cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-[#FFF0F0]">
        <ImageWithFallback 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 active:scale-95"
        />
        
        {/* Badge */}
        {badge && (
          <span className="absolute top-2 left-2 bg-[#FF6262] text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg z-10">
            {badge}
          </span>
        )}

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="bg-white text-[#505050] text-xs px-3 py-1 rounded-full font-medium">
              Hết hàng
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <h4 className="text-[#102937] text-sm mb-2 line-clamp-2 leading-snug min-h-[2.5rem]">
          {name}
        </h4>
        
        {/* Rating Row */}
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={12}
              className={star <= Math.floor(rating) ? 'text-[#FFB800] fill-[#FFB800]' : 'text-gray-300'}
            />
          ))}
          <span className="text-[#505050] text-xs ml-1">({rating})</span>
        </div>
        
        {/* Price Row */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[#FF6262] font-semibold text-base">
            {price}
          </span>
          {originalPrice && (
            <span className="text-[#505050] text-xs line-through opacity-60">
              {originalPrice}
            </span>
          )}
        </div>
        
        {/* Add to cart button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.();
          }}
          disabled={!inStock}
          className="w-full bg-[#FF6262] text-white px-3 py-3 rounded-full font-medium text-sm shadow-md shadow-[#FF6262]/30 hover:bg-[#ff4f4f] active:scale-95 disabled:bg-gray-300 disabled:shadow-none transition-all flex items-center justify-center gap-2"
          style={{ minHeight: '44px' }}
        >
          <ShoppingCart size={16} />
          <span>Thêm giỏ</span>
        </button>
      </div>
    </div>
  );
}