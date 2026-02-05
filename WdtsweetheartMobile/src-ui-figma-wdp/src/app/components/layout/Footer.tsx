import { Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#102937] py-10">
      <div className="max-w-7xl mx-auto px-5 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6262] to-[#FF9466] rounded-2xl flex items-center justify-center shadow-md">
                <span className="text-xl">🐾</span>
              </div>
              <span className="text-white text-xl" style={{ fontFamily: 'Pacifico' }}>
                Teddy Pet
              </span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Cửa hàng thú cưng uy tín với đầy đủ sản phẩm và dịch vụ chăm sóc chuyên nghiệp.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white mb-4">Liên kết nhanh</h4>
            <div className="space-y-2">
              <a href="#" className="block text-white/80 text-sm hover:text-white transition-colors">
                Về chúng tôi
              </a>
              <a href="#" className="block text-white/80 text-sm hover:text-white transition-colors">
                Dịch vụ
              </a>
              <a href="#" className="block text-white/80 text-sm hover:text-white transition-colors">
                Sản phẩm
              </a>
              <a href="#" className="block text-white/80 text-sm hover:text-white transition-colors">
                Liên hệ
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-4">Liên hệ</h4>
            <div className="space-y-2 text-white/80 text-sm">
              <p>Hotline: 1900 1234</p>
              <p>Email: info@teddypet.vn</p>
              <p>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white mb-4">Nhận tin mới</h4>
            <div className="flex gap-2 mb-4">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-2 bg-white/10 rounded-full text-white placeholder:text-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6262]"
              />
              <button className="bg-[#FF6262] text-white px-4 py-2 rounded-full font-medium shadow-lg shadow-[#FF6262]/30 hover:bg-[#ff4f4f] transition-all">
                Gửi
              </button>
            </div>
            <div className="flex gap-3">
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook size={18} className="text-white" />
              </button>
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram size={18} className="text-white" />
              </button>
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-white/60 text-xs pt-6 border-t border-white/10">
          © 2026 Teddy Pet. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
