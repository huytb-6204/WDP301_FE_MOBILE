import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

export function ServiceCard({ icon, title, description, onClick, className }: ServiceCardProps) {
  return (
    <div 
      className={`relative bg-[#FFF0F0] rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group ${className ?? ''}`}
      onClick={onClick}
    >
      {/* Icon circle */}
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
        <div className="text-[#FF6262]">
          {icon}
        </div>
      </div>
      
      {/* Content */}
      <h4 className="text-[#102937] mb-2">
        {title}
      </h4>
      <p className="text-[#505050] text-sm leading-relaxed mb-4">
        {description}
      </p>
      
      {/* Arrow button */}
      <button className="absolute bottom-6 right-6 w-10 h-10 bg-[#FF6262] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#FF6262]/30 hover:bg-[#ff4f4f] transition-all group-hover:scale-110">
        <ArrowRight size={20} />
      </button>
    </div>
  );
}
