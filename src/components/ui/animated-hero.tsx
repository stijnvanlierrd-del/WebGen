import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { MoveRight, Mail, Instagram, Linkedin, Phone } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ImageStack } from "./polaroid-flick-through";

interface HeroProps {
  onNavigate?: (page: any) => void;
}

function Hero({ onNavigate }: HeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["werkt", "raakt", "opvalt"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full px-12" style={{ marginLeft: "0px", marginTop: "0px" }}>
      <div className="max-w-7xl mx-auto">
        <div className="relative flex flex-row gap-0 pt-0 pb-24 items-center overflow-visible">
          <div className="flex-1 flex gap-8 flex-col items-start text-left z-10 relative" style={{ marginTop: "0px" }}>
            <h1 className="text-9xl tracking-tighter font-serif italic text-gray-900 leading-[0.9] flex flex-col items-start">
              <span className="whitespace-nowrap" style={{ marginLeft: "-41px", marginTop: "-7px" }}>Design dat écht</span>
              <span 
                className="relative flex overflow-hidden h-[1.1em] mt-0 min-w-[500px]"
                style={{ marginLeft: "-41px" }}
              >
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-white drop-shadow-sm"
                    style={index === 1 ? { marginTop: "0px", marginLeft: "0px", paddingLeft: "1px" } : undefined}
                    initial={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? "-100%" : "100%",
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p 
              className="text-2xl leading-relaxed tracking-tight text-gray-700 max-w-lg mt-4 font-medium backdrop-blur-[2px] bg-white/5 p-2 rounded-lg"
              style={{ marginTop: "-30px", marginLeft: "-41px" }}
            >
              Het beheren van uw online aanwezigheid is tegenwoordig een uitdaging. 
              Ons doel is om webontwikkeling te stroomlijnen, makkelijker en sneller dan ooit.
            </p>

            <div className="flex flex-row gap-4 mt-8">
              <Button 
                size="lg" 
                className="h-14 gap-4 rounded-full px-10 border-2 font-bold text-lg bg-white/40 backdrop-blur-md border-white/60 text-gray-900 hover:bg-white/60 transition-all shadow-sm" 
                variant="outline"
                style={{ marginLeft: "-39px", marginTop: "-45px" }}
              >
                Stuur een mail <Mail className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                className="h-14 gap-4 rounded-full px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg hover:scale-105 transition-all"
                style={{ marginTop: "-45px" }}
                onClick={() => onNavigate?.('Diensten')}
              >
                Kijk wat we doen <MoveRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="w-full h-px bg-gray-900/10 mt-16 mb-8" style={{ width: "1200px", marginLeft: "-33px" }} />
            
            <div className="flex flex-col gap-6" style={{ marginLeft: "-42px" }}>
              <h3 className="text-3xl font-serif italic text-gray-900" style={{ marginTop: "-50px" }}>Wat we doen:</h3>
              <div className="grid grid-cols-2 gap-4 max-w-4xl">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/50 shadow-sm hover:bg-white/40 transition-colors"
                >
                  <h4 className="font-bold text-gray-900 mb-2">Webdesign</h4>
                  <p className="text-sm leading-relaxed text-gray-700">We ontwikkelen mooi uitziende, aansluitend op uw bedrijf webdesign.</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/50 shadow-sm hover:bg-white/40 transition-colors"
                >
                  <h4 className="font-bold text-gray-900 mb-2">Logo en huisstijl designer</h4>
                  <p className="text-sm leading-relaxed text-gray-700">We ontwikkelen mooie logo’s en huisstijlen voor uw bedrijf.</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/50 shadow-sm hover:bg-white/40 transition-colors"
                >
                  <h4 className="font-bold text-gray-900 mb-2">AI intergratie</h4>
                  <p className="text-sm leading-relaxed text-gray-700">We zorgen op uw site voor een helpende hand voor uw klanten.</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/50 shadow-sm hover:bg-white/40 transition-colors"
                >
                  <h4 className="font-bold text-gray-900 mb-2">Bedrijf op Google</h4>
                  <p className="text-sm leading-relaxed text-gray-700">We maken bedrijfspagina’s op Google, met bijpassend logo.</p>
                </motion.div>
              </div>
            </div>

            <div className="w-full h-px bg-gray-900/10 mt-16 mb-8" style={{ width: "1200px", marginLeft: "-33px" }} />

            <div className="flex flex-col gap-6" style={{ marginLeft: "-42px" }}>
              <h3 className="text-3xl font-serif italic text-gray-900" style={{ marginTop: "-30px", marginLeft: "0px" }}>Vind ons ook op:</h3>
              <div className="flex flex-wrap gap-4">
                <a href="https://www.instagram.com/webgen.nu?igsh=MTlqYWY2ZHBma3h2OQ==" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="rounded-full gap-3 bg-white/30 backdrop-blur-md border-white/50 hover:bg-white/50 transition-all font-medium">
                    <Instagram className="w-5 h-5 text-pink-600" /> Instagram
                  </Button>
                </a>
                <a href="https://www.linkedin.com/company/webgen-nu/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="rounded-full gap-3 bg-white/30 backdrop-blur-md border-white/50 hover:bg-white/50 transition-all font-medium">
                    <Linkedin className="w-5 h-5 text-blue-700" /> LinkedIn
                  </Button>
                </a>
                <Button variant="outline" size="lg" className="rounded-full gap-3 bg-white/30 backdrop-blur-md border-white/50 hover:bg-white/50 transition-all font-medium">
                  <Phone className="w-5 h-5 text-green-600" /> Neem contact op
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative z-0 h-[700px] flex items-start justify-end xl:pr-0 -mt-40 -translate-x-8">
            <div className="relative transform-gpu pt-32">
              <ImageStack className="scale-125" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
