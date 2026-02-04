import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { InputField } from '@/app/components/ui/InputField';
import { PrimaryButton } from '@/app/components/ui/PrimaryButton';
import { SocialButton } from '@/app/components/ui/SocialButton';

interface LoginProps {
  onBack: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
}

export function Login({ onBack, onForgotPassword, onRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center px-5 py-6 border-b border-gray-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center">
          <ArrowLeft className="w-6 h-6 text-[#505050]" strokeWidth={1.5} />
        </button>
        <h2 className="flex-1 text-center text-[#102937] pr-10">
          Đăng nhập
        </h2>
      </div>
      
      <div className="flex-1 px-5 py-8 overflow-y-auto">
        {/* Form card */}
        <div className="bg-[#FFF0F0] rounded-[2rem] p-6 mb-6">
          <div className="space-y-5">
            <InputField
              label="Email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={setEmail}
            />
            
            <InputField
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={setPassword}
            />
          </div>
          
          <button 
            onClick={onForgotPassword}
            className="text-[#FF6262] text-sm mt-4 hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>
        
        <div className="mb-6">
          <PrimaryButton>Đăng nhập</PrimaryButton>
        </div>
        
        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-[#505050] text-sm">Hoặc đăng nhập với</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        
        {/* Social buttons */}
        <div className="space-y-3">
          <SocialButton icon={
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
              G
            </div>
          }>
            Tiếp tục với Google
          </SocialButton>
          
          <SocialButton icon={
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
              f
            </div>
          }>
            Tiếp tục với Facebook
          </SocialButton>
          
          <SocialButton icon={
            <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white text-xs">
              
            </div>
          }>
            Tiếp tục với Apple
          </SocialButton>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-5 py-6 border-t border-gray-100">
        <p className="text-center text-[#505050] text-sm">
          Chưa có tài khoản?{' '}
          <button onClick={onRegister} className="text-[#FF6262] font-medium hover:underline">
            Đăng ký
          </button>
        </p>
      </div>
    </div>
  );
}
