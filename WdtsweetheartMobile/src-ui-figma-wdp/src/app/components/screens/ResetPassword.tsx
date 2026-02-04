import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { InputField } from '@/app/components/ui/InputField';
import { PrimaryButton } from '@/app/components/ui/PrimaryButton';

interface ResetPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function ResetPassword({ onBack, onSuccess }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    // Simulate success
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-sm">
          {/* Success card */}
          <div className="bg-gradient-to-br from-[#FFF0F0] to-[#FFF3E2] rounded-[2rem] p-8 text-center mb-6">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-16 h-16 text-green-500" strokeWidth={1.5} />
              </div>
            </div>
            
            <h3 className="text-[#102937] text-2xl mb-3">
              Đặt lại thành công!
            </h3>
            <p className="text-[#505050]">
              Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.
            </p>
          </div>
          
          <PrimaryButton onClick={onSuccess}>
            Đăng nhập
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center px-5 py-6 border-b border-gray-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center">
          <ArrowLeft className="w-6 h-6 text-[#505050]" strokeWidth={1.5} />
        </button>
        <h2 className="flex-1 text-center text-[#102937] pr-10">
          Đặt lại mật khẩu
        </h2>
      </div>
      
      <div className="flex-1 px-5 py-8 flex flex-col">
        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-[#FFF0F0] to-[#FFF3E2] rounded-[2rem] flex items-center justify-center text-6xl">
            🔐
          </div>
        </div>
        
        <div className="mb-8 text-center">
          <h3 className="text-[#102937] text-xl mb-3">
            Tạo mật khẩu mới
          </h3>
          <p className="text-[#505050]">
            Mật khẩu mới phải khác với mật khẩu cũ
          </p>
        </div>
        
        {/* Form */}
        <div className="bg-[#FFF0F0] rounded-[2rem] p-6 mb-6">
          <div className="space-y-5">
            <InputField
              label="Mật khẩu mới"
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={setNewPassword}
            />
            
            <InputField
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </div>
        </div>
        
        {/* Password requirements */}
        <div className="mb-6 space-y-2">
          <p className="text-[#505050] text-xs">Mật khẩu phải có:</p>
          <ul className="text-[#505050] text-xs space-y-1 pl-4">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-[#505050] rounded-full"></span>
              Ít nhất 8 ký tự
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-[#505050] rounded-full"></span>
              Chứa chữ hoa và chữ thường
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-[#505050] rounded-full"></span>
              Ít nhất 1 số hoặc ký tự đặc biệt
            </li>
          </ul>
        </div>
        
        <div className="mt-auto">
          <PrimaryButton onClick={handleSubmit}>
            Cập nhật mật khẩu
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
