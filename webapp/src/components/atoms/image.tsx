import { useQuery } from "@tanstack/react-query";
import { forwardRef } from "react";
import { useStorageOperations } from "~/hooks/use-storage";
import { isDevMode } from "~/utils/envs";

interface ImageProps {
  alt: string;
  width?: string;
  src: string | { url?: string | null; storage: string | null };
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
    const srcUrl = typeof src === "string" ? src : (src?.url ?? "");
    const storagePath = typeof src === "string" ? undefined : src?.storage;

    const { fetchImage: _fetchImage } = useStorageOperations();

    const { data: storageUrl, isError: isStorageError } = useQuery({
      enabled: Boolean(storagePath),
      queryKey: ["storageUrl", storagePath],
      queryFn: () => _fetchImage(storagePath!),
      initialData: null,
    });

    const { data: url, error } = useQuery({
      enabled:
        Boolean(srcUrl) || (!storageUrl && !storagePath && isStorageError),
      queryKey: ["url", srcUrl],
      retry: 1,
      queryFn: async () => {
        return new Promise<string>((resolve, reject) => {
          const img = new window.Image();
          img.src = srcUrl;
          img.onload = () => resolve(img.src);
          img.onerror = (error) => {
            reject(error);
            if (isDevMode) console.error(error);
          };
        });
      },
      initialData: null,
    });

    if (fallback && (!storageUrl || isStorageError || error)) {
      return (
        <span ref={ref} {...otherProps}>
          {fallback}
        </span>
      );
    }

    return (
      <img
        ref={ref}
        src={storageUrl || url || placeholder}
        alt={alt}
        width={width}
        height={height}
        className={`h-auto max-w-full object-cover transition-opacity duration-300 ease-in-out  ${className || ""}`}
        {...otherProps}
      />
    );
  },
);
