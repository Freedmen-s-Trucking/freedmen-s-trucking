import { useState, useEffect, forwardRef } from "react";

interface ImageProps {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  placeholder?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export const AppImage = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      fallback,
      placeholder,
      className,
      ...otherProps
    },
    ref,
  ) => {
    const [currentSource, setCurrentSource] = useState(placeholder || src);
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        setCurrentSource(src);
        setShowFallback(false);
      };
      img.onerror = (e) => {
        setShowFallback(true);
        console.error(e);
      };
    }, [src]);

    if (showFallback && fallback) {
      return (
        <span ref={ref} {...otherProps}>
          {fallback}
        </span>
      );
    }

    return (
      <img
        ref={ref}
        src={currentSource}
        alt={alt}
        width={width}
        height={height}
        className={`h-auto max-w-full object-cover transition-opacity duration-300 ease-in-out  ${className || ""}`}
        {...otherProps}
      />
    );
  },
);
