import { ArrowLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { PrimaryButton } from '@/app/components/ui/PrimaryButton';

interface OTPVerificationProps {
  onBack: () => void;
  onVerify: () => void;
}

export function OTPVerification({ onBack, onVerify }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center px-5 py-6 border-b border-gray-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center">
          <ArrowLeft className="w-6 h-6 text-[#505050]" strokeWidth={1.5} />
        </button>
        <h2 className="flex-1 text-center text-[#102937] pr-10">
          Xác thực OTP
        </h2>
      </div>
      
      <div className="flex-1 px-5 py-8 flex flex-col">
        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-[#FFF0F0] to-[#FFF3E2] rounded-[2rem] flex items-center justify-center text-6xl">
            📱
          </div>
        </div>
        
        <div className="mb-8 text-center">
          <h3 className="text-[#102937] text-xl mb-3">
            Xác thực OTP
          </h3>
          <p className="text-[#505050] mb-2">
            Nhập mã 6 chữ số đã được gửi đến
          </p>
          <p className="text-[#FF6262] font-medium">
            example@email.com
          </p>
        </div>
        
        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold text-[#102937] bg-[#FFF0F0] border-2 border-[#FFF0F0] rounded-2xl focus:border-[#FF6262] focus:outline-none transition-colors"
            />
          ))}
        </div>
        
        {/* Timer and resend */}
        <div className="text-center mb-8">
          {timer > 0 ? (
            <p className="text-[#505050] text-sm">
              Gửi lại mã sau{' '}
              <span className="text-[#FF6262] font-medium">{timer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-[#FF6262] text-sm font-medium hover:underline"
            >
              Gửi lại mã OTP
            </button>
          )}
        </div>
        
        <div className="mt-auto">
          <PrimaryButton onClick={onVerify}>
            Xác nhận
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
