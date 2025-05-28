import { HTMLMotionProps, motion } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

// Primary Color #553A26;
// Secondary Color #F2E7D8;
// Typography Components
export const Heading1: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <h1
    className={twMerge(
      "mb-4 text-5xl font-bold text-primary-700 sm:text-6xl",
      className,
    )}
  >
    {children}
  </h1>
);

export const Heading2: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <h2
    className={twMerge("mb-3 text-4xl font-bold text-primary-700", className)}
  >
    {children}
  </h2>
);

export const Heading3: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <h3 className={twMerge("mb-2 text-lg font-bold text-primary-700", className)}>
    {children}
  </h3>
);

export const Tagline: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <p className={twMerge("mb-1 text-2xl text-primary-700", className)}>
    {children}
  </p>
);

export const BodyText: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <p className={twMerge("text-lg leading-relaxed text-primary-700", className)}>
    {children}
  </p>
);

// BUTTON COMPONENTS
export const PrimaryButton: React.FC<
  React.PropsWithChildren<
    {
      onClick?: () => void;
      className?: string;
      isLoading?: boolean;
      loadingText?: string;
      loadingIcon?: React.ReactNode;
    } & HTMLMotionProps<"button">
  >
> = ({
  children,
  onClick,
  className = "",
  isLoading = false,
  loadingText = "Loading...",
  loadingIcon,
  disabled,
  type,
  ...buttonProps
}) => {
  const isDisabled = disabled || isLoading || (!onClick && type !== "submit");
  const buttonVariants = {
    initial: {
      opacity: 1,
    },
    loading: {
      opacity: 0.8,
    },
  };

  return (
    <motion.button
      {...buttonProps}
      onClick={onClick}
      variants={buttonVariants}
      whileHover={isDisabled ? undefined : { scale: isLoading ? 1 : 1.05 }}
      whileTap={isDisabled ? undefined : { scale: isLoading ? 1 : 0.975 }}
      disabled={isDisabled}
      initial="initial"
      animate={isLoading ? "loading" : "initial"}
      className={twMerge(
        "flex flex-row items-center justify-center rounded-full bg-primary-700 p-3 font-medium text-primary-100 shadow-md transition-colors duration-300 hover:bg-primary-800 disabled:bg-opacity-80",
        className,
      )}
    >
      {isLoading ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex w-full flex-row items-center justify-evenly gap-2"
          transition={{ type: "spring", stiffness: 100 }}
        >
          {loadingIcon || (
            <span className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-primary-100/30 border-t-primary-50" />
          )}
          <span className="text-primary-100">{loadingText}</span>
        </motion.div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export const SecondaryButton: React.FC<
  React.PropsWithChildren<
    {
      className?: string;
      isLoading?: boolean;
      loadingText?: string;
      disabled?: boolean;
    } & HTMLMotionProps<"button">
  >
> = ({
  children,
  onClick,
  className = "",
  isLoading = false,
  type,
  loadingText = "Loading...",
  disabled,
  ...buttonProps
}) => {
  const isDisabled = disabled || isLoading || (!onClick && type !== "submit");

  const buttonVariants = {
    initial: {
      opacity: isDisabled ? 0.5 : 1,
    },
    loading: {
      opacity: 0.5,
    },
  };

  return (
    <motion.button
      {...buttonProps}
      onClick={onClick}
      variants={buttonVariants}
      whileHover={isDisabled ? undefined : { scale: isLoading ? 1 : 1.05 }}
      whileTap={isDisabled ? undefined : { scale: isLoading ? 1 : 0.975 }}
      disabled={isDisabled}
      initial="initial"
      animate={isLoading ? "loading" : "initial"}
      className={twMerge(
        "flex flex-row items-center justify-center rounded-full border-2 border-primary-700/80 bg-primary-100 p-3 font-medium text-primary-700 shadow-md transition-colors duration-300",
        className,
      )}
    >
      {isLoading ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex w-full flex-row items-center justify-evenly gap-2"
          transition={{ type: "spring", stiffness: 100 }}
        >
          <span className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-primary-700/30 border-t-primary-700" />
          <span className="text-primary-700">{loadingText}</span>
        </motion.div>
      ) : (
        children
      )}
    </motion.button>
  );
};
export const TextInput = React.forwardRef<
  HTMLInputElement,
  {
    onEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    className?: string;
    endIcon?: React.ReactNode;
    endIconShowCondition?: "always" | "onFocus" | "onHover" | "never";
  } & React.ComponentPropsWithoutRef<"input">
>(
  (
    {
      className = "",
      onEnter,
      endIcon,
      endIconShowCondition = "always",
      ...inputProps
    },
    ref,
  ) => {
    const [canShowEndIcon, setCanShowEndIcon] = useState<boolean>(
      endIconShowCondition === "always",
    );

    return (
      <span className="relative">
        <input
          {...inputProps}
          className={twMerge(
            "block w-full rounded-full border border-gray-300 bg-primary-50 p-2.5 text-sm text-secondary-950 focus:border-secondary-500 focus:ring-secondary-500 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          onFocus={(e) => {
            if (endIconShowCondition === "onFocus") {
              setCanShowEndIcon(true);
            }
            if (inputProps.onFocus) {
              inputProps.onFocus(e);
            }
          }}
          onMouseEnter={(e) => {
            if (endIconShowCondition === "onHover") {
              setCanShowEndIcon(true);
            }
            if (inputProps.onMouseEnter) {
              inputProps.onMouseEnter(e);
            }
          }}
          onMouseLeave={(e) => {
            if (endIconShowCondition === "onHover") {
              setCanShowEndIcon(false);
            }
            if (inputProps.onMouseLeave) {
              inputProps.onMouseLeave(e);
            }
          }}
          onBlur={(e) => {
            if (endIconShowCondition === "onFocus") {
              setCanShowEndIcon(false);
            }
            if (inputProps.onBlur) {
              inputProps.onBlur(e);
            }
          }}
          ref={ref}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (onEnter) {
                onEnter(e);
                return;
              }
              e.preventDefault();
              const form = e.currentTarget.form;
              if (!form) return;
              const index = Array.from(form).indexOf(e.currentTarget);
              const nextElement = form.elements[index + 1];
              if (nextElement) {
                (nextElement as { focus?: () => void }).focus?.();
              } else {
                form.dispatchEvent(
                  new Event("submit", { bubbles: true, cancelable: true }),
                );
              }
            }
          }}
        />
        {endIcon && canShowEndIcon && (
          <div className="absolute right-2 top-1/2 inline -translate-y-1/2">
            {endIcon}
          </div>
        )}
      </span>
    );
  },
);

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  {
    className?: string;
    rows?: number;
    maxLength?: number;
    onEnter?: () => void;
    resize?: "none";
  } & React.ComponentPropsWithoutRef<"textarea">
>(
  (
    {
      rows,
      className = "",
      onEnter,
      maxLength,
      resize = "none",
      ...textAreaProps
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const combinedRef = (node: HTMLTextAreaElement) => {
      internalRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          node;
    };

    const handleInput = useCallback(() => {
      const el = internalRef.current;
      if (!el) return;

      el.style.minHeight = "auto";
      el.style.minHeight = `${Math.min(el.scrollHeight, (rows || 1) * 24)}px`; // limit to 3 rows (assuming ~24px line-height)
    }, [rows]);

    useEffect(() => {
      handleInput();
    }, [handleInput]);

    return (
      <textarea
        {...textAreaProps}
        ref={combinedRef}
        rows={rows || 1}
        maxLength={maxLength}
        onInput={handleInput}
        className={twMerge(
          "block w-full resize-none overflow-hidden rounded-xl border border-gray-300 bg-primary-50 p-1 text-sm text-secondary-950 focus:border-secondary-500 focus:ring-secondary-500 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        style={{ resize, ...textAreaProps.style }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (onEnter) {
              onEnter();
              return;
            }
            const form = e.currentTarget.form;
            if (!form) return;
            const index = Array.from(form).indexOf(e.currentTarget);
            const nextElement = form.elements[index + 1];
            if (nextElement) {
              (nextElement as { focus?: () => void }).focus?.();
            } else {
              console.log("No next element");
              form.dispatchEvent(
                new Event("submit", { bubbles: true, cancelable: true }),
              );
            }
          }
        }}
      />
    );
  },
);

// export const TextArea = React.forwardRef<
//   HTMLTextAreaElement,
//   {
//     className?: string;
//     rows?: number;
//     maxLength?: number;
//     resize?: "none";
//   } & React.ComponentPropsWithoutRef<"textarea">
// >(({ className = "", maxLength, resize = "none", ...textAreaProps }, ref) => (
//   <textarea
//     {...textAreaProps}
//     className={`block w-full rounded-lg border border-gray-300 bg-primary-50 p-1 text-sm text-secondary-950 focus:border-secondary-500 focus:ring-secondary-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
//     ref={ref}
//     maxLength={maxLength}
//     style={{ resize }}
//     onKeyDown={(e) => {
//       if (e.key === "Enter") {
//         e.preventDefault();
//         const form = e.currentTarget.form;
//         console.log({ form });
//         if (!form) return;
//         const index = Array.from(form).indexOf(e.currentTarget);
//         const nextElement = form.elements[index + 1];
//         if (nextElement) {
//           (nextElement as { focus?: () => void }).focus?.();
//         } else {
//           console.log("No next element");
//           // form.dispatchEvent(
//           //   new Event("submit", { bubbles: true, cancelable: true }),
//           // );
//         }
//       }
//     }}
//   />
// ));

// CARD COMPONENTS

export const Card: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <div
    className={twMerge(
      "overflow-hidden rounded-lg bg-white shadow-md",
      className,
    )}
  >
    {children}
  </div>
);

export const FeatureCard: React.FC<
  React.PropsWithChildren<{
    title: string;
    description: string;
    className?: string;
  }>
> = ({ title, description, className = "" }) => (
  <div className={twMerge("p-6 text-center", className)}>
    <h3 className="mb-2 text-xl font-medium text-primary-700">{title}</h3>
    <p className="text-primary-700">{description}</p>
  </div>
);

// LAYOUT COMPONENTS
export const Container: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <div className={twMerge("mx-auto px-3", className)}>{children}</div>
);
