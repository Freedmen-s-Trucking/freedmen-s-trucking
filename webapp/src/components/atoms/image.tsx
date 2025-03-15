import { useState, useEffect } from "react";

interface ImageProps {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  align?: "left" | "center" | "right";
  placeholder?: string;
  className?: string;
}

const StyledImage: React.FC<{
  src: string;
  alt: string;
  width?: string;
  height?: string;
  className?: string;
}> = ({ src, alt, height, width, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`h-auto max-w-full object-cover transition-opacity duration-300 ease-in-out  ${className || ""}`}
    />
  );
};

export const AppImage = ({
  src,
  alt,
  width,
  height,
  placeholder,
  className,
}: ImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
      setShowPlaceholder(false);
    };
    img.onerror = (e) => {
      setIsLoaded(false);
      setShowPlaceholder(true);
      console.error(e);
    };
  }, [src]);

  return (
    <>
      {showPlaceholder && placeholder && (
        <StyledImage
          src={placeholder}
          alt={alt}
          width={width}
          height={height}
          className={className}
        />
      )}
      {isLoaded && (
        <StyledImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className || ""} ${isLoaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </>
  );
};
