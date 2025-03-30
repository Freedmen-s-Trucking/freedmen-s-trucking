import { HTMLMotionProps, motion } from "motion/react";
import React from "react";

// Primary Color #553A26;
// Secondary Color #F2E7D8;
// Typography Components
export const Heading1: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <h1
    className={`mb-4 text-5xl font-bold text-primary-700 sm:text-6xl ${className}`}
  >
    {children}
  </h1>
);

export const Heading2: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <h2 className={`mb-3 text-4xl font-bold text-primary-700 ${className}`}>
    {children}
  </h2>
);

export const Heading3: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <h3 className={`mb-2 text-3xl font-bold text-primary-700 ${className}`}>
    {children}
  </h3>
);

export const Tagline: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <p className={`mb-1 text-2xl text-primary-700 ${className}`}>{children}</p>
);

export const BodyText: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <p className={`leading-relaxed text-primary-700 ${className} text-lg`}>
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
    } & HTMLMotionProps<"button">
  >
> = ({
  children,
  onClick,
  className = "",
  isLoading = false,
  loadingText = "Loading...",
  ...buttonProps
}) => {
  const buttonVariants = {
    initial: {
      opacity: 1,
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
      whileHover={{ scale: isLoading ? 1 : 1.05 }}
      whileTap={{ scale: isLoading ? 1 : 0.975 }}
      disabled={isLoading}
      initial="initial"
      animate={isLoading ? "loading" : "initial"}
      className={`flex flex-row items-center justify-center rounded-lg bg-primary-700  p-4 font-medium text-primary-100 transition-colors duration-300 hover:bg-primary-800 disabled:bg-primary-800 ${className}`}
    >
      {isLoading ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex w-full flex-row items-center justify-evenly gap-2"
          transition={{ type: "spring", stiffness: 100 }}
        >
          <span className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-primary-100/30 border-t-primary-50" />
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
      onClick?: () => void;
      className?: string;
      isLoading?: boolean;
      loadingText?: string;
    } & HTMLMotionProps<"button">
  >
> = ({
  children,
  onClick,
  className = "",
  isLoading = false,
  loadingText = "Loading...",
  ...buttonProps
}) => {
  const buttonVariants = {
    initial: {
      opacity: 1,
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
      whileHover={{ scale: isLoading ? 1 : 1.05 }}
      whileTap={{ scale: isLoading ? 1 : 0.975 }}
      disabled={isLoading}
      initial="initial"
      animate={isLoading ? "loading" : "initial"}
      className={`flex flex-row items-center justify-center rounded-lg border-2 border-primary-700/80 bg-primary-100 p-4 font-medium text-primary-700 transition-colors duration-300 hover:bg-primary-50 ${className}`}
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

// iNPUT COMPONENTS
export const TextInput = React.forwardRef<
  HTMLInputElement,
  { className?: string } & React.ComponentProps<"input">
>(({ className = "", ...inputProps }, ref) => (
  <input
    {...inputProps}
    className={`block w-full rounded-lg border border-gray-300 bg-primary-50 p-2.5 py-3 text-sm text-secondary-950 focus:border-secondary-500 focus:ring-secondary-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    ref={ref}
  />
));

// CARD COMPONENTS

export const Card: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <div className={`overflow-hidden rounded-lg bg-white shadow-md ${className}`}>
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
  <div className={`p-6 text-center ${className}`}>
    <h3 className={`mb-2 text-xl font-medium text-primary-700`}>{title}</h3>
    <p className={`text-primary-700`}>{description}</p>
  </div>
);

// LAYOUT COMPONENTS
export const Container: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => (
  <div className={`mx-auto  px-3 ${className}`}>{children}</div>
);
