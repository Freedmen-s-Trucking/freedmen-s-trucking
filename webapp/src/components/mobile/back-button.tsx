import { ChevronLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';
export function BackButton({isPrimary , mainText}: {isPrimary: boolean, mainText: string}) {
  if(isPrimary) {
    return (
      <Link to="/app/user/home" className="bg-mobile-background rounded-full flex items-center justify-start">
        <ChevronLeft  className="w- h-6 text-mobile-text " />
        <span className="text-mobile-text  font-mobile text-[20px]" >{mainText}</span>
      </Link>
    );
  }
  return (
    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
      <ChevronLeft className="w-6 h-6" />
    </button>
  );
}