import { PrimaryButton } from '@/app/components/ui/PrimaryButton';

interface WelcomeSplashProps {
  onNext: () => void;
}

export function WelcomeSplash({ onNext }: WelcomeSplashProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6262] to-[#FF9466] flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-32 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mb-6">
          <span className="text-6xl">🐾</span>
        </div>
        
        {/* Brand name */}
        <h1 className="text-white text-4xl mb-3" style={{ fontFamily: 'Pacifico' }}>
          Teddy Pet
        </h1>
        
        {/* Mascot illustration */}
        <div className="my-8 relative">
          <div className="w-48 h-48 bg-white/20 rounded-[3rem] flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
            <span className="text-8xl">🐕</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[#102937] rounded-full flex items-center justify-center shadow-xl">
            <span className="text-3xl">❤️</span>
          </div>
        </div>
        
        {/* Subtext */}
        <p className="text-white/90 text-lg text-center mb-12 max-w-xs">
          Kết nối yêu thương cùng thú cưng
        </p>
        
        {/* CTA */}
        <div className="w-full max-w-sm">
          <button
            onClick={onNext}
            className="w-full bg-white text-[#FF6262] px-8 py-4 rounded-full font-medium text-lg shadow-2xl hover:shadow-xl active:scale-95 transition-all"
          >
            Bắt đầu
          </button>
        </div>
      </div>
    </div>
  );
}
