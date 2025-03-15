import { useState, useEffect } from "react";

interface ImageProps {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  aspectRatio?: string;
  align?: "left" | "center" | "right";
  placeholder?: string;
  className?: string;
}

const ImageWrapper: React.FC<{ align?: string; children: React.ReactNode }> = ({
  align,
  children,
}) => (
  <div
    className={`relative ${align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"}`}
  >
    {children}
  </div>
);

const StyledImage: React.FC<{
  src: string;
  alt: string;
  width?: string;
  height?: string;
  aspectRatio?: string;
  className?: string;
}> = ({ src, alt, height, width, aspectRatio, className }) => {
  console.log({ aspectRatio });

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
// const Placeholder: React.FC<{
//   width?: string;
//   height?: string;

//   placeholder?: string;
// }> = ({ width, height, placeholder }) => (
//   <div
//     className="bg-[#f0f0f0]"
//     style={{ width: width || "100%", height: height || "auto" }}
//   >
//     <img
//       src={placeholder}
//       alt="placeholder"
//       className="w-full h-full object-cover"
//     />
//   </div>
// );

export const AppImage = ({
  src,
  alt,
  width,
  height,
  aspectRatio,
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
    img.onerror = () => {
      setIsLoaded(false);
      setShowPlaceholder(true);
    };
  }, [src]);

  return (
    <div>
      {showPlaceholder && placeholder && (
        <StyledImage
          src={placeholder}
          alt={alt}
          width={width}
          height={height}
          className={className}
          aspectRatio={aspectRatio}
        />
      )}
      {isLoaded && (
        <StyledImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          aspectRatio={aspectRatio}
          className={`${className || ""} ${isLoaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
};
