import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Calendar } from 'lucide-react';

interface BlogCardProps {
  image: string;
  title: string;
  excerpt: string;
  date: string;
  onClick?: () => void;
  className?: string;
}

export function BlogCard({ image, title, excerpt, date, onClick, className }: BlogCardProps) {
  return (
    <div 
      className={`bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${className ?? ''}`}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#FFF0F0]">
        <ImageWithFallback 
          src={image} 
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 text-[#505050] text-xs mb-2">
          <Calendar size={14} />
          <span>{date}</span>
        </div>
        
        <h4 className="text-[#102937] mb-2 line-clamp-2">
          {title}
        </h4>
        
        <p className="text-[#505050] text-sm leading-relaxed line-clamp-2">
          {excerpt}
        </p>
      </div>
    </div>
  );
}
