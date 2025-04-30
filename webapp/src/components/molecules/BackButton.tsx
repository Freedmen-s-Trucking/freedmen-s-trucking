import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface BackButtonProps {
  to: string;
}

export const BackButton = ({ to }: BackButtonProps) => {
  return (
    <Link 
      to={to}
      className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
    >
      <ArrowLeft className="w-6 h-6" />
    </Link>
  );
}; 