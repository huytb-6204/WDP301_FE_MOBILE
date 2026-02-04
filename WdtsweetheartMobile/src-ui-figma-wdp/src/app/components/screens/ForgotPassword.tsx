import { ArrowLeft, Mail } from 'lucide-react';
import { useState } from 'react';
import { InputField } from '@/app/components/ui/InputField';
import { PrimaryButton } from '@/app/components/ui/PrimaryButton';

interface ForgotPasswordProps {
  onBack: () => void;
  onSendOTP: () => void;
}

export function ForgotPassword({ onBack, onSendOTP }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center px-5 py-6 border-b border-gray-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center">
          <ArrowLeft className="w-6 h-6 text-[#505050]" strokeWidth={1.5} />
        </button>
        <h2 className="flex-1 text-center text-[#102937] pr-10">
          Quên mật khẩu
        </h2>
      </div>
      
      <div className="flex-1 px-5 py-8 flex flex-col">
        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-[#FFF0F0] to-[#FFF3E2] rounded-[2rem] flex items-center justify-center">
            <Mail className="w-16 h-16 text-[#FF6262]" strokeWidth={1.5} />
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-[#102937] text-xl text-center mb-3">
            Quên mật khẩu?
          </h3>
          <p className="text-[#505050] text-center">
            Nhập địa chỉ email của bạn để nhận mã OTP xác thực
          </p>
        </div>
        
        <div className="mb-6">
          <InputField
            label="Email"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={setEmail}
          />
        </div>
        
        <div className="mt-auto">
          <PrimaryButton onClick={onSendOTP}>
            Gửi mã OTP
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
