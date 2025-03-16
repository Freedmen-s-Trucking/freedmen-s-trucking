import React from "react";
import AppNavbar from "../organisms/navbar";
import { AppImageBackground } from "../atoms/image-background";

const Hero: React.FC<{
  className?: string;
  children: React.ReactNode;
  image: string;
  bluredImage?: string;
}> = ({ children, bluredImage, image, className }) => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector(".hero-section");
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        setIsScrolled(rect.bottom <= 80);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <AppImageBackground
        src={image}
        placeholder={bluredImage}
        className={`hero-section w-100 inset-0 ${className}`}
      >
        <div className="mx-auto max-w-screen-xl px-4 py-8  md:px-8 md:py-12 lg:px-16">
          <div
            className={`fixed left-0 right-0 top-0 z-50 transition-colors duration-300 md:relative md:bg-transparent ${isScrolled ? "bg-gray-900" : ""}`}
          >
            <AppNavbar />
          </div>
          {children}
        </div>
      </AppImageBackground>
    </>
  );
};

export default Hero;
