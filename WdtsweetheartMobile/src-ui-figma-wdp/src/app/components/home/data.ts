import type { ReactNode } from 'react';

export type ServiceItem = {
  icon: ReactNode;
  title: string;
  description: string;
};

export type StatItem = {
  value: string;
  label: string;
  className: string;
  valueClass: string;
  labelClass: string;
};

export type ProductItem = {
  image: string;
  name: string;
  price: string;
  originalPrice?: string;
};

export type BlogItem = {
  image: string;
  title: string;
  excerpt: string;
  date: string;
};

export const stats: StatItem[] = [
  {
    value: '240+',
    label: 'Đã bán',
    className: 'bg-gradient-to-br from-[#FF6262] to-[#FF9466] text-white shadow-lg',
    valueClass: 'text-white',
    labelClass: 'text-white/90',
  },
  {
    value: '35+',
    label: 'Thành viên',
    className: 'bg-[#102937] text-white shadow-lg',
    valueClass: 'text-white',
    labelClass: 'text-white/90',
  },
  {
    value: '10K+',
    label: 'Hài lòng',
    className: 'bg-[#FFF0F0] shadow-sm',
    valueClass: 'text-[#FF6262]',
    labelClass: 'text-[#505050]',
  },
  {
    value: '99+',
    label: 'Sản phẩm',
    className: 'bg-[#FFF3E2] shadow-sm',
    valueClass: 'text-[#FF6262]',
    labelClass: 'text-[#505050]',
  },
];

export const products: ProductItem[] = [
  {
    image:
      'https://images.unsplash.com/photo-1628009905847-f88cf8f697b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBmb29kJTIwZG9nfGVufDF8fHx8MTc3MDE4ODM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'Thức ăn cao cấp cho chó',
    price: '450.000đ',
    originalPrice: '550.000đ',
  },
  {
    image:
      'https://images.unsplash.com/photo-1766674331619-cbb423943039?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjB0b3klMjBjdXRlfGVufDF8fHx8MTc3MDE4ODM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'Đồ chơi nhai cho thú cưng',
    price: '120.000đ',
  },
  {
    image:
      'https://images.unsplash.com/photo-1759699068450-f02a82c0c6cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNhdCUyMHBldHxlbnwxfHx8fDE3NzAxODgzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'Nhà mèo cao cấp',
    price: '890.000đ',
    originalPrice: '1.200.000đ',
  },
];

export const blogs: BlogItem[] = [
  {
    image:
      'https://images.unsplash.com/photo-1707595114464-f7e953d5f3bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjB0cmFpbmluZyUyMGRvZ3xlbnwxfHx8fDE3NzAxODgzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: '5 mẹo huấn luyện chó con hiệu quả',
    excerpt:
      'Khám phá những phương pháp đơn giản giúp chó con của bạn học nhanh hơn và vui vẻ hơn trong quá trình huấn luyện.',
    date: '28 Tháng 1, 2026',
  },
  {
    image:
      'https://images.unsplash.com/photo-1759164955427-14ca448a839d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJ5JTIwY2FyZSUyMHBldHxlbnwxfHx8fDE3NzAxODgzNzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Lịch tiêm phòng cho thú cưng đầy đủ',
    excerpt:
      'Hướng dẫn chi tiết về các loại vaccine cần thiết và thời điểm tiêm phòng phù hợp cho chó mèo.',
    date: '15 Tháng 1, 2026',
  },
  {
    image:
      'https://images.unsplash.com/photo-1761203430273-0055d7b6ba7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcHVwcHklMjBncm9vbWluZ3xlbnwxfHx8fDE3NzAxODgzNzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Chăm sóc lông cho chó mèo mùa hè',
    excerpt:
      'Những lưu ý quan trọng để giữ cho bộ lông thú cưng luôn khỏe mạnh và đẹp trong thời tiết nóng.',
    date: '2 Tháng 1, 2026',
  },
];
