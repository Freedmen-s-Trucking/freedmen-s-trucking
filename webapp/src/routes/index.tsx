import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { motion, Variants } from "motion/react";
import { useEffect, useState, useRef } from "react";

import {
  Heading1,
  Tagline,
  BodyText,
  PrimaryButton,
  SecondaryButton,
  Container,
} from "~/components/atoms";
import { useAppDispatch } from "~/stores/hooks";
import { setRequestedAuthAction } from "~/stores/controllers/app-ctrl";
import { CreateOrder } from "~/components/molecules/create-order";
import { Badge } from "flowbite-react";
import {
  DollarSignIcon,
  LockIcon,
  MapIcon,
  ServerIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { HiLockClosed } from "react-icons/hi";

// Welcome back animation
const welcomeBackVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 1, duration: 0.5, ease: "easeOut" },
  },
};

// Staggered animation for container children
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

// Animation for heading elements
const headingVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Animation for buttons and content cards
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Animation for footer
const footerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: 1.2 },
  },
};

// Animation for trust symbols
const trustSymbolVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Component for Trust Symbol
const TrustSymbol = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <motion.div
    variants={trustSymbolVariants}
    className="flex flex-col items-center px-2 py-1"
  >
    <div className="mb-1 text-primary-800">{icon}</div>
    <span className="text-center text-xs text-gray-600">{text}</span>
  </motion.div>
);

export const Route = createFileRoute("/")({
  beforeLoad({ context }) {
    if (context.user?.driverInfo) {
      throw redirect({
        to: "/app/driver/dashboard",
      });
    }
    if (context.user?.info?.isAdmin) {
      throw redirect({
        to: "/app/admin/dashboard",
      });
    }
    if (context.user?.isAnonymous === false) {
      throw redirect({
        to: "/app/customer/dashboard",
      });
    }
  },
  component: Index,
});

function Index() {
  const [isSchedulingDelivery, setIsSchedulingDelivery] = useState(false);
  const scheduleDelivery = () => setIsSchedulingDelivery(true);
  const dispatch = useAppDispatch();
  const signUpAsDriver = () =>
    dispatch(
      setRequestedAuthAction({
        type: "signup",
        targetAccount: "driver",
        redirectToDashboard: true,
      }),
    );

  const router = useRouter();
  const onOrderCreated = () => {
    setIsSchedulingDelivery(false);
    router.navigate({ to: "/app/customer/dashboard" });
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <BackgroundBalls />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex h-screen w-screen flex-col overflow-y-auto"
      >
        <Container className="flex flex-1 flex-col items-center gap-1 p-4 transition-colors duration-300 sm:gap-3 sm:p-12 sm:px-8 md:gap-8 md:p-16 lg:gap-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={welcomeBackVariants}
            className="mb-4 flex justify-between text-sm font-medium text-gray-500"
          >
            Already have an account?&nbsp;
            <button
              onClick={() =>
                dispatch(
                  setRequestedAuthAction({
                    type: "login",
                    redirectToDashboard: true,
                  }),
                )
              }
              className="font-bold text-secondary-950 hover:underline"
            >
              <Badge className="inline border border-primary-800 bg-primary-100 text-xs text-primary-900">
                Login
              </Badge>
            </button>
          </motion.div>
          <motion.div
            className="flex flex-[2] flex-col justify-end text-center xs:flex-[3] md:px-12"
            variants={containerVariants}
          >
            <motion.div variants={headingVariants}>
              <Heading1 className="mb-2">
                FREEDMEN'S <span className="inline-block">LAST MILE</span>
              </Heading1>
            </motion.div>
            <motion.div variants={headingVariants}>
              <Tagline className="mb-12">
                Powered by AI. Built for Speed.
              </Tagline>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex max-w-lg flex-[3] flex-col gap-12 xs:flex-[4] xs:flex-row xs:gap-2 sm:gap-9"
            variants={containerVariants}
          >
            <motion.div
              className="w-full max-w-sm xs:flex-1 sm:flex-1"
              variants={itemVariants}
            >
              <PrimaryButton
                onClick={signUpAsDriver}
                className="text-md w-full px-1 sm:text-xl"
              >
                Become a Driver
              </PrimaryButton>
              <BodyText className="mt-4 text-center text-sm sm:text-lg">
                Start earning with your own schedule. Simple setup, instant
                payouts, full flexibility.
              </BodyText>
            </motion.div>

            <motion.div
              className="w-full max-w-sm xs:flex-1 sm:flex-1"
              variants={itemVariants}
            >
              <SecondaryButton
                onClick={scheduleDelivery}
                className="text-md w-full px-1 sm:text-xl"
              >
                {">"}
                Place a Delivery
              </SecondaryButton>
              <BodyText className="mt-4 text-center text-sm sm:text-lg">
                Fast, reliable, professional logistics. Trusted by businesses
                and individuals across the country.
              </BodyText>
            </motion.div>
          </motion.div>
        </Container>

        {/* Footer with Trust Symbols */}
        <motion.footer
          className="w-full bg-transparent px-6 py-4 shadow-inner"
          variants={footerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="mx-auto max-w-6xl"
            variants={containerVariants}
          >
            {/* Trust Symbols */}
            <motion.div
              className="flex flex-wrap justify-evenly gap-2 border-b border-gray-200 pb-4"
              variants={containerVariants}
            >
              <TrustSymbol
                icon={<HiLockClosed className="h-6 w-6" />}
                text="Secure Payments via Stripe"
              />
              <TrustSymbol
                icon={<ShieldCheckIcon className="h-6 w-6" />}
                text="Drivers Verified by Authenticate.com"
              />
              <TrustSymbol
                icon={<LockIcon className="h-6 w-6" />}
                text="SSL Secured"
              />
              <TrustSymbol
                icon={<DollarSignIcon className="h-6 w-6" />}
                text="100% Tip Goes to Driver"
              />
              <TrustSymbol
                icon={<MapIcon className="h-6 w-6" />}
                text="Powered by Google Maps"
              />
              <TrustSymbol
                icon={<ServerIcon className="h-6 w-6" />}
                text="Firebase Technology"
              />
            </motion.div>

            {/* Contact & Legal */}
            <div className="mt-4 flex flex-col justify-between gap-4 text-center text-xs text-gray-500 md:flex-row md:text-left">
              <div className="flex flex-col items-center gap-2 md:flex-row">
                <span className="font-medium">Contact Us:</span>
                <a
                  href="mailto:roland@FreedmensTrucking.net"
                  className="text-primary-800 hover:underline"
                >
                  roland@FreedmensTrucking.net
                </a>
              </div>

              <div className="flex flex-col items-center gap-2 md:flex-row">
                <a href="/privacy" className="hover:underline">
                  Privacy Policy
                </a>
                <span className="hidden md:inline">•</span>
                <a href="/terms" className="hover:underline">
                  Terms of Use
                </a>
                <span className="hidden md:inline">•</span>
                <span>© {new Date().getFullYear()} Freedmen's Trucking</span>
              </div>
            </div>
          </motion.div>
        </motion.footer>
      </motion.div>
      {isSchedulingDelivery && (
        <CreateOrder
          showInModal={{ onClose: () => setIsSchedulingDelivery(false) }}
          brightness="light"
          onComplete={onOrderCreated}
        />
      )}
    </div>
  );
}

function BackgroundBalls() {
  const [dots, setDots] = useState<
    {
      id: number;
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      radius: number;
    }[]
  >([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Generate initial dots with random positions and velocities
    const generateDots = () => {
      const newDots = [];
      const numberOfDots = 15;

      for (let i = 0; i < numberOfDots; i++) {
        newDots.push({
          id: i,
          x: Math.random() * 80 + 10, // Position between 10-90%
          y: Math.random() * 80 + 10,
          size: Math.random() * 10 + 5, // Size between 5-15px
          vx: (Math.random() - 0.5) * 0.1, // Random velocity
          vy: (Math.random() - 0.5) * 0.1,
          radius: (Math.random() * 10 + 5) / 2, // Radius for collision detection
        });
      }

      setDots(newDots);
      return newDots;
    };

    let dotsData = generateDots();

    // Animation loop function
    const animate = () => {
      // Create a new array to store updated dots
      const updatedDots = dotsData.map((dot) => {
        // Move dots based on velocity
        let newX = dot.x + dot.vx;
        let newY = dot.y + dot.vy;
        let newVx = dot.vx;
        let newVy = dot.vy;

        // Bounce off walls
        if (newX <= 0 || newX >= 100) {
          newVx = -newVx;
          newX = newX <= 0 ? 0 : 100;
        }

        if (newY <= 0 || newY >= 100) {
          newVy = -newVy;
          newY = newY <= 0 ? 0 : 100;
        }

        return {
          ...dot,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
        };
      });

      // Check for collisions between dots
      for (let i = 0; i < updatedDots.length; i++) {
        for (let j = i + 1; j < updatedDots.length; j++) {
          const dotA = updatedDots[i];
          const dotB = updatedDots[j];

          // Calculate distance between dots
          const dx = dotA.x - dotB.x;
          const dy = dotA.y - dotB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Convert size from pixels to viewport percentage (approximation)
          const radiusSum = (dotA.radius + dotB.radius) / 2; // Simple approximation

          // Check if dots are colliding
          if (distance < radiusSum) {
            // Calculate collision angle
            const angle = Math.atan2(dy, dx);

            // Calculate components
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            // Rotate velocity vectors
            const vxA1 = dotA.vx * cos + dotA.vy * sin;
            const vyA1 = dotA.vy * cos - dotA.vx * sin;
            const vxB1 = dotB.vx * cos + dotB.vy * sin;
            const vyB1 = dotB.vy * cos - dotB.vx * sin;

            // Swap x velocities for elastic collision
            const vxA2 = vxB1;
            const vxB2 = vxA1;

            // Convert velocities back
            updatedDots[i].vx = vxA2 * cos - vyA1 * sin;
            updatedDots[i].vy = vyA1 * cos + vxA2 * sin;
            updatedDots[j].vx = vxB2 * cos - vyB1 * sin;
            updatedDots[j].vy = vyB1 * cos + vxB2 * sin;

            // Move dots apart to prevent sticking
            const overlap = radiusSum - distance;
            const moveX = (overlap * cos) / 2;
            const moveY = (overlap * sin) / 2;

            updatedDots[i].x += moveX;
            updatedDots[i].y += moveY;
            updatedDots[j].x -= moveX;
            updatedDots[j].y -= moveY;
          }
        }
      }

      // Update state with new dot positions
      dotsData = updatedDots;
      setDots([...updatedDots]);

      // Continue the animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start the animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Animated background dots with physics */}
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-black"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
          }}
          initial={{
            opacity: 0,
          }}
          animate={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            opacity: 0.05,
          }}
          transition={{
            duration: 0.1,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
}
