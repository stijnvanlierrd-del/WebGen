'use client';

import React from 'react';
import { RadialScrollGallery } from '@/src/components/ui/portfolio-and-image-gallery';
import { MoveRight } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from "@/src/components/ui/button";

const projects = [
  { id: 1, title: "Modern Design", cat: "Webdesign", img: "https://images.unsplash.com/photo-1481487196290-c152efe083f5?auto=format&fit=crop&w=600&q=80" },
  { id: 2, title: "UI Components", cat: "Interface", img: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=600&q=80" },
  { id: 3, title: "User Experience", cat: "UX Design", img: "https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=600&q=80" },
  { id: 4, title: "Custom Layouts", cat: "Frontend", img: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80" },
  { id: 5, title: "Digital Branding", cat: "Logo", img: "https://images.unsplash.com/photo-1586717791821-3f44a563fc4c?auto=format&fit=crop&w=600&q=80" },
];

export default function AboutUsGallery({ onNavigate }: { onNavigate?: (page: any) => void }) {
  return (
    <div className="bg-transparent text-foreground overflow-hidden rounded-[2.5rem] w-full mb-12">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-bounce text-gray-400 text-xs mt-4">↓ Scroll voor meer</div>
      </div>

      <RadialScrollGallery
        className="!min-h-[600px]"
        style={{ marginTop: '32px' }}
        baseRadius={450}
        mobileRadius={200}
        visiblePercentage={50}
        scrollDuration={2000}
      >
        {(activeIndex) =>
          projects.map((project, index) => {
             const isActive = activeIndex === index;
             return (
              <div 
                key={project.id} 
                className="group relative w-[200px] h-[280px] sm:w-[260px] sm:h-[360px] overflow-hidden rounded-3xl bg-white border border-white/40 shadow-2xl"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={project.img}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
                      isActive ? 'scale-110 blur-0' : 'scale-100 blur-[1px] grayscale-[30%]'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                </div>

                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-white/80 backdrop-blur border-none text-gray-900">
                      {project.cat}
                    </Badge>
                  </div>

                  <div className={`transition-transform duration-500 ${isActive ? 'translate-y-0' : 'translate-y-2'}`}>
                    <h3 className="text-xl font-bold leading-tight text-white mb-1">{project.title}</h3>
                    <div className={`h-1 bg-white mt-2 transition-all duration-500 rounded-full ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
                  </div>
                </div>
              </div>
             );
          })
        }
      </RadialScrollGallery>
    </div>
  );
}
