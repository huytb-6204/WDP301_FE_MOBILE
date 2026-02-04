import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { InputField } from '@/app/components/ui/InputField';
import { PrimaryButton } from '@/app/components/ui/PrimaryButton';

interface RegisterProps {
  onBack: () => void;
  onLogin: () => void;
}

export function Register({ onBack, onLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center px-5 py-6 border-b border-gray-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center">
          <ArrowLeft className="w-6 h-6 text-[#505050]" strokeWidth={1.5} />
        </button>
        <h2 className="flex-1 text-center text-[#102937] pr-10">
          Đăng ký
        </h2>
      </div>
      
      <div className="flex-1 px-5 py-8 overflow-y-auto">
        {/* Form */}
        <div className="bg-[#FFF0F0] rounded-[2rem] p-6 mb-6">
          <div className="space-y-5">
            <InputField
              label="Họ và tên"
              type="text"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={setName}
            />
            
            <InputField
              label="Email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={setEmail}
            />
            
            <InputField
              label="Số điện thoại"
              type="tel"
              placeholder="0909 123 456"
              value={phone}
              onChange={setPhone}
            />
            
            <InputField
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={setPassword}
            />
            
            <InputField
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </div>
        </div>
        
        {/* Checkbox */}
        <div className="flex items-start gap-3 mb-6">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-2 border-gray-300 text-[#FF6262] focus:ring-[#FF6262]"
          />
          <label htmlFor="terms" className="text-[#505050] text-sm flex-1">
            Tôi đồng ý với{' '}
            <a href="#" className="text-[#FF6262] hover:underline">
              Điều khoản dịch vụ
            </a>
            {' '}và{' '}
            <a href="#" className="text-[#FF6262] hover:underline">
              Chính sách bảo mật
            </a>
          </label>
        </div>
        
        <PrimaryButton disabled={!agreed}>
          Tạo tài khoản
        </PrimaryButton>
      </div>
      
      {/* Footer */}
      <div className="px-5 py-6 border-t border-gray-100">
        <p className="text-center text-[#505050] text-sm">
          Đã có tài khoản?{' '}
          <button onClick={onLogin} className="text-[#FF6262] font-medium hover:underline">
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
}
