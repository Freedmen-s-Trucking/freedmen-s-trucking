import { motion } from "motion/react";

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
  React.PropsWithChildren<{
    onClick?: () => void;
    className?: string;
    isLoading?: boolean;
    loadingText?: string;
  }>
> = ({
  children,
  onClick,
  className = "",
  isLoading = false,
  loadingText = "Loading...",
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
      onClick={onClick}
      variants={buttonVariants}
      whileHover={{ scale: isLoading ? 1 : 1.05 }}
      whileTap={{ scale: isLoading ? 1 : 0.975 }}
      disabled={isLoading}
      initial="initial"
      animate={isLoading ? "loading" : "initial"}
      className={`flex h-[60px] flex-row items-center justify-center rounded-lg bg-primary-700  px-1 py-1 font-medium text-primary-100 transition-colors duration-300 hover:bg-primary-800 disabled:bg-primary-800 ${className}`}
    >
      {isLoading ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex w-full flex-row items-center justify-evenly gap-2"
          transition={{ type: "spring", stiffness: 100 }}
        >
          <span className="border-primary-100/33 inline-block h-7 w-7 animate-spin rounded-full border-4 border-t-primary-100" />
          <span className="text-primary-100">{loadingText}</span>
        </motion.div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export const SecondaryButton: React.FC<
  React.PropsWithChildren<{
    onClick?: () => void;
    className?: string;
    isLoading?: boolean;
    loadingText?: string;
  }>
> = ({
  children,
  onClick,
  className = "",
  isLoading = false,
  loadingText = "Loading...",
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
      onClick={onClick}
      variants={buttonVariants}
      whileHover={{ scale: isLoading ? 1 : 1.05 }}
      whileTap={{ scale: isLoading ? 1 : 0.975 }}
      disabled={isLoading}
      initial="initial"
      animate={isLoading ? "loading" : "initial"}
      className={`flex h-[60px] flex-row items-center justify-center rounded-lg border-2 border-primary-700/80 bg-primary-100 bg-primary-700/10 px-1 py-1 font-medium text-primary-700 transition-colors duration-300 hover:bg-primary-700/20 ${className}`}
    >
      {isLoading ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex w-full flex-row items-center justify-evenly gap-2"
          transition={{ type: "spring", stiffness: 100 }}
        >
          <span className="border-primary-700/33 inline-block h-7 w-7 animate-spin rounded-full border-4 border-t-primary-700" />
          <span className="text-primary-700">{loadingText}</span>
        </motion.div>
      ) : (
        children
      )}
    </motion.button>
  );
};

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
