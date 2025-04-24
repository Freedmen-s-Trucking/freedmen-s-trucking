import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
// import snapLogo from "@/assets/images/splash-screen-logo.png";

interface VerificationCodeProps {
  phoneNumber: string;
  onVerify: (code: string) => void;
  isAgent?: boolean;
}

export const VerificationCode: React.FC<VerificationCodeProps> = ({
  phoneNumber,
  onVerify,
  isAgent = false
}) => {
  const [code, setCode] = useState(['', '', '', '']);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length === 4) {
      onVerify(fullCode);
    }
  };

  const handleResendCode = () => {
    // Implement resend code logic here
    console.log('Resending code...');
  };

  return (
    <div className="flex flex-col items-center px-4 pt-8 bg-mobile-background text-mobile-text font-mobile h-screen">
      <div className="w-full max-w-md ">
        {/* <div className="flex items-center justify-center mt-[39px] mb-[45px]">
          <img src={snapLogo} alt="Snap Logo" className="h-[41px] w-[108px]" />
        </div> */}
        
        <h1 className="text-[20px] font-semibold mb-2 ">Enter the 4-digit code</h1>
        <p className="text-[12px] text-gray-600 mb-4">
        Please input  the verification code sent to your phone number 23480*******90
          {phoneNumber.replace(/(\d{5})(\d{4})(\d{2})/, '$1*******$3')}
        </p>
        
        <Link to="/" className="text-mobile-text hover:text-mobile-text mb-8 block">
          Change number?
        </Link>

        <div className="flex gap-4 mb-6">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              className="w-16 h-16 text-center text-2xl border rounded-lg bg-mobile-background focus:border-mobile-button focus:ring-1 focus:ring-mobile-button"
            />
          ))}
        </div>

        <div className="mb-6 text-center text-[12px]">
          <span className="text-gray-600">Didn't get any code yet? </span>
          <button
            onClick={handleResendCode}
            className="text-mobile-text underline"
          >
            Resend code
          </button>
        </div>

       
       <Link to={isAgent ? "/app/agents/home" : "/app/user/home"} className="w-full">
       <button
          onClick={handleVerify}
          disabled={code.some(digit => !digit)}
          className="w-full bg-mobile-button text-white py-4 rounded-lg font-medium hover:bg-mobile-button disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Verify
        </button>
        </Link>
        <div className="flex items-center justify-center">
        <p className="text-[12px] text-gray-600 text-center mt-6 max-w-[230px]">
          By signing up, you agree to snap{' '}
          <Link to="/" className="underline">Terms of Service</Link> and{' '}
          <Link to="/" className="underline">Privacy Policy</Link>.
        </p>
        </div>
      </div>
    </div>
  );
}; 