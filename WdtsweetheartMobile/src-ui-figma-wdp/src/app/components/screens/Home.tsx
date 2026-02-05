import { useMemo, useState } from 'react';
import {
  Menu,
  Search,
  ShoppingCart,
  Heart,
  Scissors,
  Stethoscope,
  GraduationCap,
  CheckCircle,
  Star,
  ArrowRight,
  Mail,
  Facebook,
  Instagram,
  Twitter,
} from 'lucide-react';
import { ServiceCard } from '../home/ServiceCard';
import { ProductCard } from '../home/ProductCard';
import { BlogCard } from '../home/BlogCard';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { blogs, products, stats } from '../home/data';

export function Home() {
  const [cartCount] = useState(3);
  const services = useMemo(
    () => [
      {
        icon: <Scissors size={28} strokeWidth={1.5} />,
        title: 'Spa & Grooming',
        description: 'Tắm gội, cắt tỉa lông chuyên nghiệp',
      },
      {
        icon: <Stethoscope size={28} strokeWidth={1.5} />,
        title: 'Khám sức khỏe',
        description: 'Bác sĩ thú y giàu kinh nghiệm',
      },
      {
        icon: <GraduationCap size={28} strokeWidth={1.5} />,
        title: 'Huấn luyện',
        description: 'Đào tạo kỹ năng cơ bản đến nâng cao',
      },
      {
        icon: <Heart size={28} strokeWidth={1.5} />,
        title: 'Khách sạn',
        description: 'Lưu trú an toàn, thoải mái',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 bg-white border-b border-[rgba(0,0,0,0.1)]">
        <div className="max-w-[375px] mx-auto px-5 py-4">
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
                placeholder="Tìm kiếm sản phẩm"
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
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-br from-[#FF6262] to-[#FF9466] overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-5 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-[375px] mx-auto px-5 py-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/30">
            <Star size={16} className="text-white fill-white" />
            <span className="text-white text-sm font-medium">2k+ khách hàng hài lòng</span>
          </div>
          
          {/* Title */}
          <h1 className="text-white mb-4 leading-tight">
            Chăm sóc thú cưng<br />chuyên nghiệp
          </h1>
          
          {/* Subtitle */}
          <p className="text-white/90 leading-relaxed mb-8 max-w-xs">
            Dịch vụ spa, khám sức khỏe, huấn luyện và cửa hàng thú cưng uy tín hàng đầu Việt Nam
          </p>
          
          {/* CTAs */}
          <div className="flex gap-3 mb-8">
            <button className="flex-1 bg-white text-[#FF6262] px-6 py-4 rounded-full font-medium shadow-xl hover:shadow-2xl active:scale-95 transition-all">
              Xem thêm
            </button>
            <button className="flex-1 bg-transparent text-white px-6 py-4 rounded-full font-medium border-2 border-white hover:bg-white/10 active:scale-95 transition-all">
              Đặt lịch
            </button>
          </div>
          
          {/* Illustration */}
          <div className="relative flex justify-center">
            <div className="w-56 h-56 bg-white/20 rounded-[3rem] flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
              <span className="text-9xl">🐕</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[#102937] rounded-full flex items-center justify-center shadow-xl">
              <span className="text-3xl">❤️</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES SECTION ===== */}
      <section className="max-w-[375px] mx-auto px-5 py-12">
        {/* Section Header */}
        <div className="text-center mb-8">
          <p className="text-[#FF6262] text-sm font-medium mb-2">Dịch vụ của chúng tôi</p>
          <h2 className="text-[#102937] mb-3">
            Chăm sóc toàn diện
          </h2>
          <p className="text-[#505050] text-sm leading-relaxed max-w-sm mx-auto">
            Từ spa, khám bệnh đến huấn luyện, chúng tôi có tất cả những gì thú cưng của bạn cần
          </p>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-4">
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </section>

      {/* ===== ABOUT / STORY SECTION ===== */}
      <section className="bg-[#FFF3E2] py-12">
        <div className="max-w-[375px] mx-auto px-5">
          {/* Images stack */}
          <div className="relative mb-8 flex justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute top-0 left-0 w-48 h-48 rounded-[28px] overflow-hidden shadow-xl rotate-3 z-10">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1705175975965-c25516b7fcd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBldCUyMGRvZyUyMG93bmVyfGVufDF8fHx8MTc3MDE4ODM3MHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Happy pet"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-48 h-48 rounded-[28px] overflow-hidden shadow-xl -rotate-3">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1761203430273-0055d7b6ba7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcHVwcHklMjBncm9vbWluZ3xlbnwxfHx8fDE3NzAxODgzNzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Pet grooming"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-[#102937] text-center mb-6">
            Tại sao chọn Teddy Pet?
          </h2>
          
          {/* Benefits list */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <CheckCircle size={20} className="text-[#FF6262]" />
              </div>
              <div>
                <h4 className="text-[#102937] mb-1">Đội ngũ chuyên nghiệp</h4>
                <p className="text-[#505050] text-sm leading-relaxed">
                  Bác sĩ thú y, groomer được đào tạo bài bản
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <CheckCircle size={20} className="text-[#FF6262]" />
              </div>
              <div>
                <h4 className="text-[#102937] mb-1">Cơ sở hiện đại</h4>
                <p className="text-[#505050] text-sm leading-relaxed">
                  Trang thiết bị y tế và grooming cao cấp
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <CheckCircle size={20} className="text-[#FF6262]" />
              </div>
              <div>
                <h4 className="text-[#102937] mb-1">Yêu thương thật sự</h4>
                <p className="text-[#505050] text-sm leading-relaxed">
                  Chúng tôi đối xử với thú cưng như gia đình
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="flex justify-center">
            <button className="bg-[#FF6262] text-white px-8 py-4 rounded-full font-medium shadow-lg shadow-[#FF6262]/30 hover:bg-[#ff4f4f] active:scale-95 transition-all">
              Đặt lịch ngay
            </button>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="max-w-[375px] mx-auto px-5 py-10">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-[24px] p-6 text-center ${stat.className}`}
            >
              <div className={`text-3xl font-bold mb-1 ${stat.valueClass}`}>{stat.value}</div>
              <div className={`text-sm ${stat.labelClass}`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MARQUEE BANNER ===== */}
      <section className="bg-[#102937] py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-white text-sm mx-8">🎉 Ưu đãi mùa hè – Miễn phí ship đơn trên 300k</span>
          <span className="text-white text-sm mx-8">🐾 Giảm 20% dịch vụ spa tháng này</span>
          <span className="text-white text-sm mx-8">❤️ Tích điểm đổi quà hấp dẫn</span>
          <span className="text-white text-sm mx-8">🎉 Ưu đãi mùa hè – Miễn phí ship đơn trên 300k</span>
          <span className="text-white text-sm mx-8">🐾 Giảm 20% dịch vụ spa tháng này</span>
          <span className="text-white text-sm mx-8">❤️ Tích điểm đổi quà hấp dẫn</span>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS SECTION ===== */}
      <section className="max-w-[375px] mx-auto py-12">
        {/* Section Header */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#102937]">
              Sản phẩm nổi bật
            </h2>
            <button className="text-[#FF6262] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Xem tất cả
              <ArrowRight size={16} />
            </button>
          </div>
          <p className="text-[#505050] text-sm">
            Những sản phẩm được yêu thích nhất
          </p>
        </div>
        
        {/* Products Carousel */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-5 pb-2">
            {products.map((product) => (
              <ProductCard
                key={product.name}
                image={product.image}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== BLOG / NEWS SECTION ===== */}
      <section className="bg-[#FFF0F0] py-12">
        <div className="max-w-[375px] mx-auto px-5">
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-[#102937] mb-3">
              Tin tức & Mẹo hay
            </h2>
            <p className="text-[#505050] text-sm">
              Cập nhật kiến thức chăm sóc thú cưng
            </p>
          </div>
          
          {/* Blog Cards */}
          <div className="space-y-4">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.title}
                image={blog.image}
                title={blog.title}
                excerpt={blog.excerpt}
                date={blog.date}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER MINI ===== */}
      <footer className="bg-[#102937] py-10">
        <div className="max-w-[375px] mx-auto px-5">
          {/* Newsletter */}
          <div className="mb-8">
            <h3 className="text-white mb-3 text-center">
              Nhận tin tức mới nhất
            </h3>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
                <input 
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-full text-white placeholder:text-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6262]"
                />
              </div>
              <button className="bg-[#FF6262] text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-[#FF6262]/30 hover:bg-[#ff4f4f] transition-all">
                Gửi
              </button>
            </div>
          </div>
          
          {/* Social icons */}
          <div className="flex justify-center gap-4 mb-8">
            <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <Facebook size={20} className="text-white" />
            </button>
            <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <Instagram size={20} className="text-white" />
            </button>
            <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <Twitter size={20} className="text-white" />
            </button>
          </div>
          
          {/* Quick links */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-center">
            <a href="#" className="text-white/80 text-sm hover:text-white transition-colors">
              Về chúng tôi
            </a>
            <a href="#" className="text-white/80 text-sm hover:text-white transition-colors">
              Dịch vụ
            </a>
            <a href="#" className="text-white/80 text-sm hover:text-white transition-colors">
              Sản phẩm
            </a>
            <a href="#" className="text-white/80 text-sm hover:text-white transition-colors">
              Liên hệ
            </a>
          </div>
          
          {/* Copyright */}
          <div className="text-center text-white/60 text-xs pt-6 border-t border-white/10">
            © 2026 Teddy Pet. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
