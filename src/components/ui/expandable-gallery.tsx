"use client";

import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import React, { useState, useId, useRef } from "react";
import { useOutsideClick } from "@/src/hooks/use-outside-click";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/src/lib/utils";

const PHOTOS = [
  {
    id: "photo-1",
    src: "https://images.unsplash.com/photo-1755398104393-746e52af4a9f?q=80&w=800",
    alt: "Technology setup",
    rotation: -15,
    x: -90,
    y: 10,
    zIndex: 10,
  },
  {
    id: "photo-2",
    src: "https://images.unsplash.com/photo-1756764099214-b09a5666914b?q=80&w=800",
    alt: "Design research",
    rotation: -3,
    x: -10,
    y: -15,
    zIndex: 20,
  },
  {
    id: "photo-3",
    src: "https://images.unsplash.com/photo-1757372429884-92e02350c5d9?q=80&w=800",
    alt: "Code and development",
    rotation: 12,
    x: 75,
    y: 5,
    zIndex: 30,
  },
  {
    id: "photo-4",
    src: "https://images.unsplash.com/photo-1756993399574-2fa126269ce7?q=80&w=800",
    alt: "Dashboard interface",
  },
  {
    id: "photo-5",
    src: "https://images.unsplash.com/photo-1756990637536-714b76296a30?q=80&w=800",
    alt: "Product design",
  },
  {
    id: "photo-6",
    src: "https://images.unsplash.com/photo-1756838197413-07f174def66c?q=80&w=800",
    alt: "Laptop on desk",
  },
  {
    id: "photo-7",
    src: "https://images.unsplash.com/photo-1756310406492-3ce3bef447aa?q=80&w=800",
    alt: "Team collaboration",
  },
  {
    id: "photo-8",
    src: "https://images.unsplash.com/photo-1755311905796-d539c7d24acd?q=80&w=800",
    alt: "UX wireframes",
  },
  {
    id: "photo-9",
    src: "https://images.unsplash.com/photo-1755542366797-b3f036b11310?q=80&w=800",
    alt: "Developer workspace",
  },
];

const transition = {
  type: "spring",
  stiffness: 160,
  damping: 18,
  mass: 1,
} as const;

export function ExpandableGallery() {
  const [isExpanded, setIsExpanded] = useState(false);
  const layoutGroupId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(containerRef, () => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  });

  return (
    <section className="relative w-full px-4 md:px-8 bg-transparent flex flex-col items-center justify-start min-h-[500px] overflow-hidden">
      <LayoutGroup id={layoutGroupId}>
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
          <div className="w-full h-8 flex items-center justify-between px-4 mb-2">
            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.button
                  key="back-button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all group z-50 pt-4"
                  aria-label="Ga terug"
                >
                  <div className="p-2 rounded-full bg-white/50 border border-gray-100 group-hover:bg-white transition-colors text-gray-900">
                    <HugeiconsIcon
                      icon={ArrowLeft01Icon}
                      width={20}
                      height={20}
                    />
                  </div>
                  <span className="font-medium font-serif italic">Terug</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            ref={containerRef}
            layout
            className={cn(
              "relative w-full transition-all duration-500",
              isExpanded
                ? "grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4 py-8"
                : "flex flex-col items-center justify-start -mt-20"
            )}
            transition={transition}
          >
            <div
              className={cn(
                "relative",
                isExpanded
                  ? "contents"
                  : "h-[500px] md:h-[600px] w-full flex items-center justify-center"
              )}
            >
              {PHOTOS.map((photo, index) => {
                const isPrimary = index < 3;
                if (!isPrimary && !isExpanded) return null;

                return (
                  <motion.div
                    key={`card-${photo.id}`}
                    layoutId={`card-container-${photo.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: !isExpanded ? photo.rotation || 0 : 0,
                      x: !isExpanded ? photo.x || 0 : 0,
                      y: !isExpanded ? photo.y || 0 : 0,
                      zIndex: !isExpanded ? photo.zIndex || index : 10,
                    }}
                    transition={transition}
                    whileHover={
                      !isExpanded
                        ? {
                            scale: 1.05,
                            y: (photo.y || 0) - 15,
                            rotate: (photo.rotation || 0) * 0.8,
                            zIndex: 100,
                            transition: {
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            },
                          }
                        : { scale: 1.02 }
                    }
                    className={cn(
                      "cursor-pointer overflow-hidden bg-white group shadow-2xl",
                      isExpanded
                        ? "relative aspect-square rounded-[2.5rem] md:rounded-[4rem] border-4 md:border-[8px] border-white"
                        : "absolute w-56 h-56 md:w-80 md:h-80 rounded-[2.5rem] md:rounded-[4rem] border-[8px] border-white"
                    )}
                    onClick={() => !isExpanded && setIsExpanded(true)}
                  >
                    <motion.div
                      layoutId={`image-inner-${photo.id}`}
                      layout="position"
                      className="w-full h-full relative"
                      transition={transition}
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>


          </motion.div>
        </div>
      </LayoutGroup>
    </section>
  );
}

export default ExpandableGallery;
