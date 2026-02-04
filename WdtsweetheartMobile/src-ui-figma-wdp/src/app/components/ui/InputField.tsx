import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface InputFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

export function InputField({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange,
  error 
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      <label className="block text-[#505050] text-sm font-medium mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full px-4 py-3.5 bg-white rounded-2xl border-2 ${
            error ? 'border-red-400' : 'border-gray-200'
          } focus:border-[#FF6262] focus:outline-none text-[#505050] transition-colors`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1.5">{error}</p>
      )}
    </div>
  );
}
