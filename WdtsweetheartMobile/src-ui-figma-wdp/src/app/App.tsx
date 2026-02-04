import { useState } from 'react';
import { WelcomeSplash } from '@/app/components/screens/WelcomeSplash';
import { WelcomeChoice } from '@/app/components/screens/WelcomeChoice';
import { Login } from '@/app/components/screens/Login';
import { Register } from '@/app/components/screens/Register';
import { ForgotPassword } from '@/app/components/screens/ForgotPassword';
import { OTPVerification } from '@/app/components/screens/OTPVerification';
import { ResetPassword } from '@/app/components/screens/ResetPassword';

type Screen = 
  | 'splash' 
  | 'choice' 
  | 'login' 
  | 'register' 
  | 'forgot-password' 
  | 'otp' 
  | 'reset-password';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <WelcomeSplash onNext={() => setCurrentScreen('choice')} />;
      
      case 'choice':
        return (
          <WelcomeChoice
            onLogin={() => setCurrentScreen('login')}
            onRegister={() => setCurrentScreen('register')}
            onGuest={() => alert('Tiếp tục với khách')}
          />
        );
      
      case 'login':
        return (
          <Login
            onBack={() => setCurrentScreen('choice')}
            onForgotPassword={() => setCurrentScreen('forgot-password')}
            onRegister={() => setCurrentScreen('register')}
          />
        );
      
      case 'register':
        return (
          <Register
            onBack={() => setCurrentScreen('choice')}
            onLogin={() => setCurrentScreen('login')}
          />
        );
      
      case 'forgot-password':
        return (
          <ForgotPassword
            onBack={() => setCurrentScreen('login')}
            onSendOTP={() => setCurrentScreen('otp')}
          />
        );
      
      case 'otp':
        return (
          <OTPVerification
            onBack={() => setCurrentScreen('forgot-password')}
            onVerify={() => setCurrentScreen('reset-password')}
          />
        );
      
      case 'reset-password':
        return (
          <ResetPassword
            onBack={() => setCurrentScreen('otp')}
            onSuccess={() => setCurrentScreen('login')}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile frame container */}
      <div className="max-w-[375px] mx-auto min-h-screen bg-white shadow-2xl relative overflow-hidden">
        {renderScreen()}
        
        {/* Debug navigation - Remove in production */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 flex gap-2 flex-wrap max-w-[360px] justify-center">
          {(['splash', 'choice', 'login', 'register', 'forgot-password', 'otp', 'reset-password'] as Screen[]).map((screen) => (
            <button
              key={screen}
              onClick={() => setCurrentScreen(screen)}
              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                currentScreen === screen
                  ? 'bg-[#FF6262] text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {screen}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
