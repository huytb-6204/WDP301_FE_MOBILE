import { PrimaryButton } from '@/app/components/ui/PrimaryButton';
import { SecondaryButton } from '@/app/components/ui/SecondaryButton';

interface WelcomeChoiceProps {
  onLogin: () => void;
  onRegister: () => void;
  onGuest: () => void;
}

export function WelcomeChoice({ onLogin, onRegister, onGuest }: WelcomeChoiceProps) {
  return (
    <div className="min-h-screen bg-[#FFF0F0] flex flex-col px-5 py-8">
      {/* Header */}
      <div className="flex items-center justify-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-[#FF6262] to-[#FF9466] rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">T</span>
        </div>
        <span className="font-['Pacifico'] text-2xl text-[#FF6262] ml-2">Teddy Pet</span>
      </div>
      
      {/* Hero illustration */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-8 relative">
          <div className="flex gap-4 items-end">
            <div className="w-32 h-32 bg-gradient-to-br from-[#FF6262] to-[#FF9466] rounded-[2rem] flex items-center justify-center shadow-lg">
              <span className="text-6xl">🐈</span>
            </div>
            <div className="w-32 h-32 bg-gradient-to-br from-[#102937] to-[#1a3d4f] rounded-[2rem] flex items-center justify-center shadow-lg">
              <span className="text-6xl">🐕</span>
            </div>
          </div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white rounded-full p-2 shadow-lg">
            <span className="text-2xl">💕</span>
          </div>
        </div>
        
        <h2 className="text-[#102937] text-3xl text-center mb-3">
          Chào mừng bạn
        </h2>
        <p className="text-[#505050] text-center mb-12 max-w-xs">
          Đăng nhập hoặc tạo tài khoản để tiếp tục
        </p>
        
        {/* CTAs */}
        <div className="w-full max-w-sm space-y-4">
          <PrimaryButton onClick={onLogin}>
            Đăng nhập
          </PrimaryButton>
          <SecondaryButton onClick={onRegister}>
            Đăng ký
          </SecondaryButton>
        </div>
      </div>
      
      {/* Guest option */}
      <button 
        onClick={onGuest}
        className="text-[#505050] text-sm text-center py-4 hover:text-[#FF6262] transition-colors"
      >
        Tiếp tục với khách
      </button>
    </div>
  );
}
