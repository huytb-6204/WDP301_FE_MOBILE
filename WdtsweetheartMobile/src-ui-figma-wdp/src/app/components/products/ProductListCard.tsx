import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';

interface ProductListCardProps {
  image: string;
  name: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  inStock?: boolean;
  onAddToCart?: () => void;
  viewMode?: 'grid' | 'list';
}

export function ProductListCard({ 
  image, 
  name, 
  price, 
  originalPrice, 
  badge,
  inStock = true,
  onAddToCart,
  viewMode = 'grid'
}: ProductListCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-[#FF6262]/20 group">
        <div className="flex gap-4 p-4">
          {/* Product Image */}
          <div className="relative w-32 h-32 flex-shrink-0 rounded-[20px] overflow-hidden bg-[#FFF0F0]">
            <ImageWithFallback 
              src={image} 
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {badge && (
              <span className="absolute top-2 left-2 bg-[#FF6262] text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                {badge}
              </span>
            )}
            {!inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-[#505050] text-xs px-3 py-1 rounded-full font-medium">
                  Hết hàng
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-[#102937] mb-2 line-clamp-2 group-hover:text-[#FF6262] transition-colors">
                {name}
              </h4>
              
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-[#FF6262] text-lg" style={{ fontWeight: 600 }}>
                  {price}
                </span>
                {originalPrice && (
                  <span className="text-[#505050] text-sm line-through opacity-60">
                    {originalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={onAddToCart}
                disabled={!inStock}
                className="flex-1 bg-[#FF6262] text-white px-4 py-2 rounded-full font-medium text-sm shadow-md shadow-[#FF6262]/30 hover:bg-[#ff4f4f] active:bg-[#e55555] disabled:bg-gray-300 disabled:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                Thêm giỏ hàng
              </button>
              
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                  isFavorite
                    ? 'bg-[#FF6262] text-white shadow-lg'
                    : 'bg-[#FFF0F0] text-[#FF6262] hover:bg-[#FFE5E5]'
                }`}
              >
                <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-[#FF6262]/20 group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-[#FFF0F0]">
        <ImageWithFallback 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge */}
        {badge && (
          <span className="absolute top-3 left-3 bg-[#FF6262] text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
            {badge}
          </span>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            isFavorite
              ? 'bg-[#FF6262] text-white shadow-lg'
              : 'bg-white/90 text-[#FF6262] hover:bg-white backdrop-blur-sm'
          }`}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-[#505050] text-sm px-4 py-2 rounded-full font-medium">
              Hết hàng
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h4 className="text-[#102937] mb-2 line-clamp-2 group-hover:text-[#FF6262] transition-colors">
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
          disabled={!inStock}
          className="w-full bg-[#FF6262] text-white px-4 py-3 rounded-full font-medium text-sm shadow-md shadow-[#FF6262]/30 hover:bg-[#ff4f4f] active:bg-[#e55555] disabled:bg-gray-300 disabled:shadow-none transition-all flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} />
          Thêm giỏ hàng
        </button>
      </div>
    </div>
  );
}
