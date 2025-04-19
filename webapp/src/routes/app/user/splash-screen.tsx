import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect } from "react";
import splashScreen from "@/assets/images/splash-screen-logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ to: "/app/user/onboarding" });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-mobile-background font-mobile">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center"
      >
        <img 
          src={splashScreen} 
          alt="Freedman Trucking Logo" 
          className="h-auto w-32" 
        />
      
      </motion.div>
    </div>
  );
};

// Route definition
export const Route = createFileRoute("/app/user/splash-screen")({
  beforeLoad({ context }) {
    
    if (context.user?.isAnonymous === true) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: SplashScreen,
}); 