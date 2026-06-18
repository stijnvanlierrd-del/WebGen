"use client";

import { Ref, forwardRef, useState, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";

import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

export const PhotoGallery = ({
  animationDelay = 0.5,
  onNavigate,
}: {
  animationDelay?: number;
  onNavigate?: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // First make the container visible with a fade-in
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay * 1000);

    // Then start the photo animations after a short delay
    const animationTimer = setTimeout(
      () => {
        setIsLoaded(true);
      },
      (animationDelay + 0.4) * 1000
    ); // Add 0.4s for the opacity transition

    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(animationTimer);
    };
  }, [animationDelay]);

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1, // Reduced from 0.3 to 0.1 since we already have the fade-in delay
      },
    },
  };

  // Animation variants for each photo
  const photoVariants: any = {
    hidden: () => ({
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      // Keep the same z-index throughout animation
    }),
    visible: (custom: { x: any; y: any; order: number }) => ({
      x: custom.x,
      y: custom.y,
      rotate: 0, // No rotation
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 12,
        mass: 1,
        delay: custom.order * 0.15, // Explicit delay based on order
      },
    }),
  };

  // Photo positions - horizontal layout with larger offsets and sizing
  const photos = [
    {
      id: 1,
      order: 0,
      x: "-400px",
      y: "15px",
      zIndex: 50, // Highest z-index (on top)
      direction: "left" as Direction,
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800",
    },
    {
      id: 2,
      order: 1,
      x: "-200px",
      y: "32px",
      zIndex: 40,
      direction: "left" as Direction,
      src: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800",
    },
    {
      id: 3,
      order: 2,
      x: "0px",
      y: "8px",
      zIndex: 30,
      direction: "right" as Direction,
      src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800",
    },
    {
      id: 4,
      order: 3,
      x: "200px",
      y: "22px",
      zIndex: 20,
      direction: "right" as Direction,
      src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800",
    },
    {
      id: 5,
      order: 4,
      x: "400px",
      y: "44px",
      zIndex: 10, // Lowest z-index (at bottom)
      direction: "left" as Direction,
      src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800",
    },
  ];

  return (
    <div className="mt-20 relative px-4">
       <div className="absolute inset-0 max-md:hidden top-[100px] -z-10 h-[300px] w-full bg-transparent bg-[linear-gradient(to_right,#57534e_1px,transparent_1px),linear-gradient(to_bottom,#57534e_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#a8a29e_1px,transparent_1px),linear-gradient(to_bottom,#a8a29e_1px,transparent_1px)]"></div>
      
      <h3 
        className="z-20 mx-auto justify-center bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text py-3 text-center text-6xl text-transparent dark:bg-gradient-to-r dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 dark:bg-clip-text md:text-[8.5rem] font-serif italic tracking-tight leading-none whitespace-nowrap"
        style={{ width: 'max-content', height: 'auto', marginTop: '-73px' }}
      >
        Ontdek onze <span className="text-white inline-block" style={{ marginTop: '-20px' }}>Diensten</span>
      </h3>
      <div className="flex w-full justify-center -mt-4 mb-0 relative z-30">
        <button 
          onClick={onNavigate}
          className="pointer-events-auto rounded-full px-10 py-4 border-2 font-bold text-lg bg-white/40 backdrop-blur-md border-white/60 text-gray-900 hover:bg-white/60 transition-all shadow-xl active:scale-95"
          style={{ marginTop: '12px' }}
        >
          Bekijk onze tarieven
        </button>
      </div>

      <div 
        className="relative mb-0 h-[450px] w-full items-center justify-center lg:flex overflow-visible"
        style={{ marginTop: '-55px' }}
      >
        <motion.div
          className="relative mx-auto flex w-full max-w-7xl justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            className="relative flex w-full justify-center"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            <div className="relative h-[280px] w-[280px]">
              {/* Render photos in reverse order so that higher z-index photos are rendered later in the DOM */}
              {[...photos].reverse().map((photo) => (
                <motion.div
                  key={photo.id}
                  className="absolute left-0 top-0"
                  style={{ zIndex: photo.zIndex }} // Apply z-index directly in style
                  variants={photoVariants}
                  custom={{
                    x: photo.x,
                    y: photo.y,
                    order: photo.order,
                  }}
                >
                  <Photo
                    width={280}
                    height={280}
                    src={photo.src}
                    alt="Service photo"
                    direction={photo.direction}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

function getRandomNumberInRange(min: number, max: number): number {
  if (min >= max) {
    throw new Error("Min value should be less than max value");
  }
  return Math.random() * (max - min) + min;
}

type Direction = "left" | "right";

export const Photo = ({
  src,
  alt,
  className,
  direction,
  width,
  height,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  direction?: Direction;
  width: number;
  height: number;
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  useEffect(() => {
    const randomRotation =
      getRandomNumberInRange(1, 4) * (direction === "left" ? -1 : 1);
    setRotation(randomRotation);
  }, []);

  function handleMouse(event: {
    currentTarget: { getBoundingClientRect: () => any };
    clientX: number;
    clientY: number;
  }) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  const resetMouse = () => {
    x.set(200);
    y.set(200);
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      whileTap={{ scale: 1.2, zIndex: 60 }}
      whileHover={{
        scale: 1.1,
        rotateZ: 2 * (direction === "left" ? -1 : 1),
        zIndex: 60,
      }}
      whileDrag={{
        scale: 1.1,
        zIndex: 60,
      }}
      initial={{ rotate: 0 }}
      animate={{ rotate: rotation }}
      style={{
        width,
        height,
        perspective: 400,
        zIndex: 1,
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        touchAction: "none",
      }}
      className={cn(
        className,
        "relative mx-auto shrink-0 cursor-grab active:cursor-grabbing"
      )}
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      draggable={false}
      tabIndex={0}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-sm border border-white/20">
        <img
          className={cn("rounded-3xl object-cover w-full h-full")}
          src={src}
          alt={alt}
          {...props}
          draggable={false}
        />
      </div>
    </motion.div>
  );
};
