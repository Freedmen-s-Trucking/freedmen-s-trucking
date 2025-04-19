import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';

interface VerificationCodeProps {
  phoneNumber: string;
  onVerify: (code: string) => void;
}

export const VerificationCode: React.FC<VerificationCodeProps> = ({
  phoneNumber,
  onVerify,
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
    <div className="flex flex-col items-center px-4 pt-8">
      <div className="w-full max-w-md">
        <img src="/snap-logo.svg" alt="Snap Logo" className="h-12 mb-8" />
        
        <h1 className="text-2xl font-semibold mb-2">Enter the 4-digit code</h1>
        <p className="text-gray-600 mb-4">
          Please input the verification code sent to your phone number{' '}
          {phoneNumber.replace(/(\d{5})(\d{4})(\d{2})/, '$1*******$3')}
        </p>
        
        <Link to="/change-number" className="text-teal-700 hover:text-teal-800 mb-8 block">
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
              className="w-16 h-16 text-center text-2xl border rounded-lg bg-gray-50 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          ))}
        </div>

        <div className="mb-6 text-center">
          <span className="text-gray-600">Didn't get any code yet? </span>
          <button
            onClick={handleResendCode}
            className="text-teal-700 hover:text-teal-800 underline"
          >
            Resend code
          </button>
        </div>

        <button
          onClick={handleVerify}
          disabled={code.some(digit => !digit)}
          className="w-full bg-teal-700 text-white py-4 rounded-lg font-medium hover:bg-teal-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Verify
        </button>

        <p className="text-sm text-gray-600 text-center mt-6">
          By signing up, you agree to snap{' '}
          <Link to="/terms" className="underline">Terms of Service</Link> and{' '}
          <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}; 