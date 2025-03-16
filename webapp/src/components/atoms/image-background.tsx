import { useState, useEffect } from "react";

interface ImageProps {
  src: string;
  children?: React.ReactNode;
  placeholder?: string;
  customGradient?: string;
  className?: string;
}

export const AppImageBackground = ({
  src,
  placeholder,
  children,
  className,
  customGradient,
}: ImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(placeholder || src);
  const gradient =
    customGradient || "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5))";

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
    };
    img.onerror = (e) => {
      console.error(e);
    };
  }, [src]);

  return (
    <div
      style={{
        backgroundImage: `${gradient}, url('${currentSrc}')`,
      }}
      className={`bg-black bg-cover bg-fixed bg-center bg-no-repeat ${className || ""}`}
    >
      {children}
    </div>
  );
};
