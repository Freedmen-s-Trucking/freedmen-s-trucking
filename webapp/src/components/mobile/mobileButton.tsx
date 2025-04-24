import { Link } from "@tanstack/react-router";

interface MobileButtonProps {
  isPrimary: boolean;
  text: string;
  link?: string;
  onClick?: () => void;
}

export const MobileButton = ({ isPrimary, text, link, onClick }: MobileButtonProps) => {
  const buttonClass = `w-full flex justify-center items-center p-5 ${isPrimary ? 'bg-mobile-button text-white' : 'bg-mobile-background text-mobile-text'} rounded-xl border border-mobile-text`;

  if (link) {
    return (
      <Link to={link} className={buttonClass}>
        <button className="text-center">
          {text}
        </button>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClass}>
      {text}
    </button>
  );
};