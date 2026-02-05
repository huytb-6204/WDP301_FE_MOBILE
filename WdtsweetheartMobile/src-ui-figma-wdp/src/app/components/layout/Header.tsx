import { useState } from 'react';
import { Menu, Search, ShoppingCart, User } from 'lucide-react';

interface HeaderProps {
  variant?: 'mobile' | 'desktop' | 'both';
  cartCount?: number;
}

export function Header({ variant = 'both', cartCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[rgba(0,0,0,0.1)] shadow-sm">
      {/* Desktop Header */}
      {(variant === 'desktop' || variant === 'both') && (
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto">
            {/* Top Bar */}
            <div className="border-b border-[rgba(0,0,0,0.05)] py-2 px-6">
              <div className="flex items-center justify-between text-sm">
                <div className="text-[#505050]">
                  Hotline: <span className="text-[#FF6262] font-medium">1900 1234</span>
                </div>
                <div className="flex items-center gap-4">
                  <a href="#" className="text-[#505050] hover:text-[#FF6262] transition-colors">
                    Về chúng tôi
                  </a>
                  <a href="#" className="text-[#505050] hover:text-[#FF6262] transition-colors">
                    Liên hệ
                  </a>
                </div>
              </div>
            </div>

            {/* Main Header */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between gap-6">
                {/* Logo */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FF6262] to-[#FF9466] rounded-2xl flex items-center justify-center shadow-md">
                    <span className="text-2xl">🐾</span>
                  </div>
                  <span className="text-[#102937] text-2xl" style={{ fontFamily: 'Pacifico' }}>
                    Teddy Pet
                  </span>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-xl relative">
                  <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#505050]" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm"
                    className="w-full pl-14 pr-6 py-3 bg-[#f3f3f5] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6262]/20"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#FFF0F0] transition-colors">
                    <User size={24} className="text-[#102937]" />
                  </button>
                  
                  <button className="relative w-12 h-12 flex items-center justify-center rounded-full bg-[#FFF0F0] hover:bg-[#FFE5E5] transition-colors">
                    <ShoppingCart size={24} className="text-[#FF6262]" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#FF6262] text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <button className="bg-[#FF6262] text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-[#FF6262]/30 hover:bg-[#ff4f4f] transition-all">
                    Đặt lịch
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Bar */}
            <div className="border-t border-[rgba(0,0,0,0.05)] px-6">
              <nav className="flex items-center gap-8 py-3">
                <a href="#" className="text-[#505050] hover:text-[#FF6262] font-medium transition-colors">
                  Trang chủ
                </a>
                <a href="#" className="text-[#505050] hover:text-[#FF6262] font-medium transition-colors">
                  Sản phẩm
                </a>
                <a href="#" className="text-[#505050] hover:text-[#FF6262] font-medium transition-colors">
                  Dịch vụ
                </a>
                <a href="#" className="text-[#505050] hover:text-[#FF6262] font-medium transition-colors">
                  Tin tức
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      {(variant === 'mobile' || variant === 'both') && (
        <div className="lg:hidden">
          <div className="px-5 py-4">
            {/* Top row: Logo & Menu */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6262] to-[#FF9466] rounded-2xl flex items-center justify-center shadow-md">
                  <span className="text-xl">🐾</span>
                </div>
                <span className="text-[#102937]" style={{ fontFamily: 'Pacifico', fontSize: '1.25rem' }}>
                  Teddy Pet
                </span>
              </div>
              
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#FFF0F0] transition-colors">
                <Menu size={24} className="text-[#102937]" />
              </button>
            </div>
            
            {/* Search bar & Cart */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#505050]" />
                <input 
                  type="text"
                  placeholder="Tìm kiếm"
                  className="w-full pl-12 pr-4 py-3 bg-[#f3f3f5] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6262]/20"
                />
              </div>
              
              <button className="relative w-12 h-12 flex items-center justify-center rounded-full bg-[#FFF0F0] hover:bg-[#FFE5E5] transition-colors">
                <ShoppingCart size={20} className="text-[#FF6262]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6262] text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
