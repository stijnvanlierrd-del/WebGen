import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/src/components/ui/button";

// Seeded pseudo-random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

export interface ImageData {
  src: string;
  alt: string;
  id: string;
}

interface ScatterPosition {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface ImageStackProps {
  images?: ImageData[];
  maxRotation?: number;
  scatterRadius?: number;
  seed?: number;
  className?: string;
  onReshuffle?: () => void;
}

export interface ImageStackRef {
  reshuffle: () => void;
}

// Framer Motion variants for container and cards
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0,
      staggerChildren: 0.15, // Faster stagger for better feel
    },
  },
};

const DEFAULT_IMAGES: ImageData[] = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=800&fit=crop",
    alt: "Creative Agency Office",
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&h=800&fit=crop",
    alt: "Design Studio",
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=800&fit=crop",
    alt: "Collaboration",
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=800&fit=crop",
    alt: "Daily Workflow",
  },
];

export const ImageStack = React.forwardRef<ImageStackRef, ImageStackProps>(
  (
    {
      images = DEFAULT_IMAGES,
      maxRotation = 5,
      scatterRadius = 15,
      seed = 42,
      className = "",
      onReshuffle,
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [imagesLoaded, setImagesLoaded] = React.useState(false);
    const [currentImages, setCurrentImages] = React.useState<ImageData[]>(images);
    const [scatterPositions, setScatterPositions] = React.useState<
      ScatterPosition[]
    >([]);
    const [currentSeed, setCurrentSeed] = React.useState(seed);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useReducedMotion();

    const generateScatterPositions = React.useCallback(
      (seedValue: number) => {
        const rng = new SeededRandom(seedValue);
        return currentImages.map(() => ({
          x: rng.range(-40, 40), // Adjusted for better overlap feel
          y: rng.range(-scatterRadius, scatterRadius),
          rotation: rng.range(-maxRotation, maxRotation),
          scale: rng.range(0.95, 1.05),
        }));
      },
      [currentImages, scatterRadius, maxRotation]
    );

    React.useEffect(() => {
      setScatterPositions(generateScatterPositions(currentSeed));
      setImagesLoaded(true);
      setIsVisible(true);
    }, [currentSeed, generateScatterPositions]);

    const reshuffle = React.useCallback(() => {
      const newSeed = Math.floor(Math.random() * 1000000);
      setCurrentSeed(newSeed);
      onReshuffle?.();
    }, [onReshuffle]);

    const handleCardClick = (id: string) => {
      // Prevent multiple clicks during animation if needed
      setCurrentImages((prev) => {
        if (prev.length <= 1) return prev;
        const [top, ...rest] = prev;
        return [...rest, top];
      });
    };

    const cardVariants = {
      hidden: (custom: { zIndex: number }) => ({
        x: 0,
        y: 0,
        rotate: 0,
        scale: 0.8,
        opacity: 0,
        zIndex: custom.zIndex,
      }),
      visible: (custom: {
        position: ScatterPosition;
        zIndex: number;
        springConfig: any;
        isTop: boolean;
      }) => ({
        x: custom.position.x,
        y: custom.position.y,
        rotate: custom.position.rotation,
        scale: custom.position.scale,
        opacity: 1,
        zIndex: custom.zIndex,
        transition: custom.springConfig,
      }),
    };

    React.useImperativeHandle(
      ref,
      () => ({
        reshuffle,
      }),
      [reshuffle]
    );

    const springConfig = prefersReducedMotion
      ? { type: "tween" as const, duration: 0.4 }
      : { type: "spring" as const, stiffness: 350, damping: 25, mass: 1.2 };

    return (
      <div className={`relative w-full h-[600px] md:h-[800px] flex items-center justify-center ${className}`}>
        <motion.div
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center"
          style={{ perspective: "2500px" }}
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {currentImages.map((image, index) => {
            const position = scatterPositions[index];
            if (!position) return null;

            return (
              <motion.div
                key={image.id}
                className="absolute origin-center cursor-pointer"
                onClick={() => handleCardClick(image.id)}
                variants={cardVariants}
                custom={{
                  position: position,
                  zIndex: currentImages.length - index,
                  springConfig: springConfig,
                  isTop: index === 0,
                }}
                whileHover={index === 0 ? { 
                  scale: 1.08, 
                  rotate: position.rotation + 2, 
                  y: -10,
                  zIndex: 100, 
                  transition: { duration: 0.2, type: "spring", stiffness: 300 } 
                } : {}}
                whileTap={{ scale: 0.92, rotateY: 10 }}
                layout
                transition={springConfig}
              >
                <div 
                  className="w-[280px] bg-white p-3 pb-8 shadow-xl border border-white/40 rounded-sm transform-gpu transition-shadow hover:shadow-orange-200/20"
                  style={{
                    // Centering them to be neatly grouped + applying requested margins
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    marginLeft: index === 0 ? "-300px" : index === 1 ? "-176px" : index === 2 ? "-190px" : index === 3 ? "-276px" : "-250px",
                    marginTop: index === 0 ? "-248px" : index === 1 ? "-417px" : index === 2 ? "-395px" : index === 3 ? "-243px" : "-300px",
                    marginRight: index === 1 ? "-4px" : undefined,
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full aspect-square object-cover rounded-sm pointer-events-none"
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                  <div className="mt-4 text-base text-gray-700 text-center font-serif italic select-none">
                    {image.alt}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    );
  }
);
ImageStack.displayName = "ImageStack";
