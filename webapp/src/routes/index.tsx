import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

import {
  Heading1,
  Tagline,
  BodyText,
  PrimaryButton,
  SecondaryButton,
  Container,
} from "@/components/atoms";
import { useAppDispatch } from "@/stores/hooks";
import { setRequestedAuthAction } from "@/stores/controllers/app-ctrl";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const dispatch = useAppDispatch();
  const requestSignIn = () =>
    dispatch(
      setRequestedAuthAction({ type: "signup", targetAccount: "driver" }),
    );

  // Staggered animation for container children
  const containerVariants = {
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
  const headingVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Animation for buttons and content cards
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <BackgroundBalls />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Container className="flex h-screen w-screen flex-col items-center gap-1 px-4 transition-colors duration-300 sm:gap-3 sm:p-12 sm:px-8 md:gap-8 md:p-16 lg:gap-12">
          <motion.div
            className="xs:flex-[3] flex flex-[2] flex-col justify-end text-center md:px-12"
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
            className="xs:flex-row xs:flex-[4] xs:gap-2 flex max-w-lg flex-[3] flex-col gap-12 sm:gap-9"
            variants={containerVariants}
          >
            <motion.div
              className="xs:flex-1 w-full max-w-sm sm:flex-1"
              variants={itemVariants}
            >
              <PrimaryButton
                onClick={requestSignIn}
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
              className="xs:flex-1 w-full max-w-sm sm:flex-1"
              variants={itemVariants}
            >
              <SecondaryButton className="text-md w-full px-1 sm:text-xl">
                Place a Delivery
              </SecondaryButton>
              <BodyText className="mt-4 text-center text-sm sm:text-lg">
                Fast, reliable, professional logistics. Trusted by businesses
                and individuals across the country.
              </BodyText>
            </motion.div>
          </motion.div>
        </Container>
      </motion.div>
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
