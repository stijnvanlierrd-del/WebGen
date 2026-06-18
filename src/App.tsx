/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Menu, Search, X, ChevronRight, Phone, Mail, MapPin, Check, ArrowLeft, ArrowRight, MoveRight, Lock, Unlock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Hero } from '@/src/components/ui/animated-hero';
import { RadialScrollGallery } from '@/src/components/ui/portfolio-and-image-gallery';
import { ExpandableGallery } from '@/src/components/ui/expandable-gallery';
import { PhotoGallery } from '@/src/components/ui/gallery';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion';
import InfiniteGallery from '@/src/components/ui/3d-gallery-photography';
import AboutUsGallery from '@/src/components/ui/about-us-gallery';
import ContactForm from '@/src/components/ui/contact-form';
import { CustomerDashboard } from '@/src/components/CustomerDashboard';
import { auth, googleProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@/src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { UserProfile } from '@/src/types';

type Page = 'Home' | 'Diensten' | 'Prijzen' | 'Over ons' | 'Contact' | 'Calculator' | 'Portaal';

const ServiceItem = ({ title, desc, details, containerStyle, titleStyle }: { title: string; desc: string; details: string; containerStyle?: React.CSSProperties; titleStyle?: React.CSSProperties; key?: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div 
      onClick={() => setIsOpen(!isOpen)}
      className={`bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/40 hover:bg-white/60 transition-all cursor-pointer group shadow-2xl ${isOpen ? 'h-auto' : 'h-[240px]'}`}
      style={containerStyle}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight" style={titleStyle}>{title}</h3>
        <ChevronRight className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
      </div>
      <p className="text-gray-700 mt-4 text-base md:text-lg leading-relaxed font-medium">
        {desc}
      </p>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-gray-700 text-sm md:text-base leading-relaxed shadow-inner">
              {details}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InteractiveQuiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    pages: '',
    storage: '',
    visitors: '',
    features: [] as string[]
  });

  const questions = [
    {
      id: 'pages',
      question: 'Hoeveel pagina\'s heeft u nodig?',
      options: ['Tot 10 pagina\'s (Inbegrepen)', '11 - 15 pagina\'s (+€60 p.s.)', '15+ pagina\'s (Op maat)']
    },
    {
      id: 'features',
      question: 'Welke extra opties wilt u toevoegen?',
      options: ['AI Chatbot (€60)', 'Webshop (€200)', 'Logo & Huisstijl ontwerp (€75)', 'Meertaligheid'],
      multiple: true
    },
    {
      id: 'storage',
      question: 'Verwacht u veel dataopslag nodig te hebben?',
      options: ['Standaard (1GB)', 'Extra opslag (In overleg)', 'Grote webshop (In overleg)']
    }
  ];

  const calculatePrice = () => {
    let total = 250; // Basis prijs
    
    // Pagina toeslag
    if (answers.pages === '11 - 15 pagina\'s (+€60 p.s.)') total += 60; // Indicatie voor één extra pagina als start
    
    // Functies
    if (answers.features.includes('AI Chatbot (€60)')) total += 60;
    if (answers.features.includes('Webshop (€200)')) total += 200;
    if (answers.features.includes('Logo & Huisstijl ontwerp (€75)')) total += 75;
    if (answers.features.includes('Meertaligheid')) total += 100;

    return total;
  };

  const handleNext = () => {
    if (step < questions.length) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentQuestion = questions[step];

  if (step >= questions.length) {
    const totalPrice = calculatePrice();
    return (
      <div className="space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-500/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-serif italic text-gray-900">Uw ideale site is gevonden!</h3>
          <p className="text-gray-700">Op basis van uw behoeften hebben we een schatting gemaakt.</p>
        </div>
        
        <div className="bg-white/40 p-6 rounded-3xl border border-white/40 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-white/20">
            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Geraamde Investering</span>
            <span className="text-3xl font-bold text-blue-600">€{totalPrice}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pagina's:</span>
              <span className="text-gray-900 font-bold">{answers.pages}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Opslag:</span>
              <span className="text-gray-900 font-bold">{answers.storage}</span>
            </div>
            {answers.features.length > 0 && (
              <div className="flex flex-col gap-1 pt-2">
                <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">Extra Functies:</span>
                <span className="text-gray-900 font-medium text-sm">
                  {answers.features.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setStep(0)}
            className="flex-1 py-4 bg-white/40 border border-white/40 text-gray-700 rounded-2xl font-bold hover:bg-white/60 transition-all active:scale-95"
          >
            Opnieuw
          </button>
          <button 
            className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95"
          >
            Vraag Offerte Aan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-[400px] flex flex-col justify-between">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">Stap {step + 1} van {questions.length}</span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-blue-600' : 'w-2 bg-blue-200'}`} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-3xl md:text-4xl font-serif italic text-gray-900 leading-tight">
            {currentQuestion.question}
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option) => {
              const isSelected = 
                currentQuestion.id === 'pages' ? answers.pages === option :
                currentQuestion.id === 'storage' ? answers.storage === option :
                answers.features.includes(option);

              return (
                <button
                  key={option}
                  onClick={() => {
                    if (currentQuestion.id === 'pages') setAnswers({ ...answers, pages: option });
                    else if (currentQuestion.id === 'storage') setAnswers({ ...answers, storage: option });
                    else {
                      const newFeatures = answers.features.includes(option)
                        ? answers.features.filter(f => f !== option)
                        : [...answers.features, option];
                      setAnswers({ ...answers, features: newFeatures });
                    }
                  }}
                  className={`p-4 rounded-2xl text-left border-2 transition-all duration-300 font-bold ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                      : 'bg-white/40 border-white/20 text-gray-700 hover:bg-white/60 hover:border-white/40'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{option}</span>
                    {isSelected && <Check className="w-5 h-5 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t border-white/20">
        {step > 0 && (
          <button 
            onClick={handleBack}
            className="px-8 py-4 bg-white/20 border border-white/40 rounded-2xl font-bold text-gray-700 hover:bg-white/40 transition-all active:scale-95"
          >
            Vorig
          </button>
        )}
        <button 
          onClick={handleNext}
          disabled={
            (currentQuestion.id === 'pages' && !answers.pages) ||
            (currentQuestion.id === 'storage' && !answers.storage)
          }
          className={`flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {step === questions.length - 1 ? 'Afronden' : 'Volgende vraag'}
        </button>
      </div>
    </div>
  );
};

const SEARCH_ITEMS: { page: Page; keywords: string[] }[] = [
  { page: 'Home', keywords: ['start', 'begin', 'introductie', 'home', 'welkom', 'hoofdpagina'] },
  { page: 'Diensten', keywords: ['diensten', 'services', 'wat we doen', 'webdesign', 'ontwerper van logo’s', 'logo ontwerp', 'ai integratie', 'gegevens over uw site', 'bedrijf op google', 'portfolio', 'proces', 'werk'] },
  { page: 'Prijzen', keywords: ['prijzen', 'kosten', 'pakket', 'basis site', 'opties', 'extra', 'euro', 'tarieven'] },
  { page: 'Calculator', keywords: ['calculator', 'berekenen', 'prijs schatting', 'configurator', 'kosten berekenen', 'offerte'] },
  { page: 'Over ons', keywords: ['over ons', 'wie zijn wij', 'verhaal', 'awards', 'missie', 'webgen', 'team'] },
  { page: 'Contact', keywords: ['contact', 'email', 'telefoon', 'locatie', 'bericht', 'adres', 'hulp', 'vragen'] }
];

export default function App() {
  const [activePage, setActivePage] = useState<Page>('Home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [manualRotation, setManualRotation] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ page: Page; keywords: string[] }[]>([]);
  const [scale, setScale] = useState(1);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Email and Password Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const targetWidth = 1440; // Desktop/Laptop target width
      if (window.innerWidth < targetWidth) {
        setScale(window.innerWidth / targetWidth);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "U",
          photoURL: firebaseUser.photoURL
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError('Vul alstublieft alle velden in.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (authMode === 'login') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (result.user) {
          setUser({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || email.split('@')[0],
            photoURL: result.user.photoURL
          });
          setActivePage('Portaal');
          setEmail('');
          setPassword('');
        }
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (result.user) {
          setUser({
            uid: result.user.uid,
            email: result.user.email,
            displayName: email.split('@')[0],
            photoURL: null
          });
          setActivePage('Portaal');
          setEmail('');
          setPassword('');
        }
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      let friendlyMessage = "Er is een fout opgetreden bij de login. Controleer uw invoer.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        friendlyMessage = 'Onjuist e-mailadres of wachtwoord.';
      } else if (error.code === 'auth/invalid-email') {
        friendlyMessage = 'Ongeldig e-mailadres.';
      } else if (error.code === 'auth/email-already-in-use') {
        friendlyMessage = 'Dit e-mailadres is al in gebruik.';
      } else if (error.code === 'auth/weak-password') {
        friendlyMessage = 'Het wachtwoord moet minimaal 6 tekens bevatten.';
      }
      setAuthError(friendlyMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setActivePage('Home');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      const filtered = SEARCH_ITEMS.filter(item => 
        item.page.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const goToStep = (index: number) => {
    if (isRotating || index === activeStep) return;
    setIsRotating(true);
    setActiveStep(index);
    setManualRotation(-index * (360 / 5));
    setTimeout(() => setIsRotating(false), 800);
  };

    const rotate = (direction: 'left' | 'right') => {
      const newStep = direction === 'left' 
        ? (activeStep - 1 + 5) % 5 
        : (activeStep + 1) % 5;
      goToStep(newStep);
    };
  
    const rotateLeft = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      rotate('left');
    };
    
    const rotateRight = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      rotate('right');
    };

  const pages: Page[] = ['Home', 'Diensten', 'Prijzen', 'Over ons', 'Contact', 'Portaal'];

  const renderContent = () => {
    switch (activePage) {
      case 'Diensten':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-0 space-y-12"
          >
            <PhotoGallery onNavigate={() => setActivePage('Prijzen')} />
            
            <div className="px-16 space-y-12 pb-16">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                {[
                  { 
                    title: 'Webdesign', 
                    desc: 'We ontwikkelen mooi uitziende, aansluitend op uw bedrijf webdesign.',
                    details: 'Wij verzorgen een mooie visuele site passend bij uw bedrijf, huidige vormgeving en/of logo. Indien uw bedrijf geen eigen logo of huisstijl heeft kunnen wij deze ook ontwikkelen, heeft uw bedrijf wel een logo? We kunnen uw site ook ontwikkelen met dat logo.\n\nHet design kan voorziend worden met mooie foto’s vanuit onze eigen collecties, maar we kunnen ook mooie foto’s van uw bedrijf gebruiken.\n\nDe site kan een informaties design hebben, maar kan ook (in een combinatie met) een webshop design hebben. Zo kunnen we de site ontwerpen en maken voor uw optimale publiek.'
                  },
                  { 
                    title: 'Logo en huisstijl designer', 
                    desc: 'We ontwikkelen mooie logo’s en huisstijlen voor uw bedrijf.',
                    details: 'Uw publiek maakt voor de eerste keer kennis met uw bedrijf via de mail, social media en/of een site. Op deze plekken is een logo essentieel. We helpen graag mee om deze te ontwikkelen.\n\nEen logo en huisstijl voor al uw platformen, heel belangrijk! We helpen te kijken naar uw branche, en stemmen samen met uw wensen een mooi design samen. Zo is er op al uw platformen een mooie lijndraad.'
                  },
                  { 
                    title: 'AI intergratie', 
                    desc: 'We zorgen op uw site voor een helpende hand voor uw klanten.',
                    details: 'U bent al druk genoeg met het beheren van uw bedrijf. Veel vragen die u krijgt zijn op bijvoorbeeld uw site al te vinden. Hier komt AI van pas, we kunnen een slimme AI-bot op uw site plaatsen, welke met enkel de informatie van uw site de eerste helpende hand kan zijn.'
                  },
                  { 
                    title: 'Gegevens over uw site', 
                    desc: 'We koppelen *maandelijks de prestaties terug en passen aan waar nodig.',
                    details: 'Inhoudelijk te weten komen hoe uw site peereert, wat kan er beter? We koppelen het *maandelijks terug.\n\n*maandelijks indien er gekozen is voor de ad-on voor maandelijks onderhoud.',
                    containerStyle: { marginTop: '10px' }
                  },
                  { 
                    title: 'Bedrijf op Google', 
                    desc: 'We maken bedrijfspagina’s op Google, met bijpassend logo.',
                    details: 'Als er op Google gezocht wordt naar uw bedrijf is een blokje met informatie op Google essentieel, om zo een eerste indruk te maken. Wij helpen u verder, en houden deze *maandelijks up to date.\n\n*maandelijks indien er gekozen is voor de ad-on voor maandelijks onderhoud.',
                    titleStyle: { marginTop: '0px' }
                  }
                ].map((service) => (
                  <ServiceItem 
                    key={service.title} 
                    title={service.title} 
                    desc={service.desc} 
                    details={service.details} 
                    containerStyle={service.containerStyle}
                    titleStyle={service.titleStyle}
                  />
                ))}
              </div>
            </div>
          </div>


            <div className="space-y-8 -mt-24 md:-mt-32" style={{ marginTop: '-90px' }}>
              <div className="text-center space-y-4" style={{ marginLeft: '0px' }}>
                <h2 className="text-3xl md:text-5xl font-serif italic text-gray-900" style={{ marginLeft: '10px' }}>Ons Proces</h2>
                <p className="text-gray-600 max-w-xl mx-auto md:text-lg">
                  Benieuwd naar onze werkwijze? Bekijk hem hieronder:
                </p>
              </div>
              
              <div className="bg-white/30 backdrop-blur-sm rounded-[40px] border border-white/20 overflow-hidden relative">
                <RadialScrollGallery
                  className="!min-h-[500px]"
                  baseRadius={400}
                  mobileRadius={180}
                  manualRotation={manualRotation}
                  activeIndex={activeStep}
                  visiblePercentage={60}
                  onItemSelect={goToStep}
                >
                  {(hoveredIndex) =>
                    [
                      { step: "01", title: "Vraag ontdekken", desc: "We bekijken de aanvraag en nemen contact op om de aanvraag en gegevens te bevestigen." },
                      { step: "02", title: "Strategie", desc: "We bekijken uw bedrijf en kijken wat we kunnen gaan maken." },
                      { step: "03", title: "Ontwikkeling", desc: "We ontwikkelen uw aangevraagde dienst." },
                      { step: "04", title: "Laatste hand", desc: "We verbeteren aangeleverde punten, voor een optimaal resultaat." },
                      { step: "05", title: "Oplevering", desc: "We leveren de dienst aan, het proces is klaar." },
                    ].map((item, index) => {
                      const isCurrentStep = activeStep === index;
                      const isActive = hoveredIndex === index || isCurrentStep;
                      
                      return (
                        <div
                          key={index}
                          className={`
                            relative w-[200px] h-[280px] sm:w-[280px] sm:h-[380px] 
                            rounded-[32px] border p-8 flex flex-col justify-between items-start 
                            transition-all duration-700 shadow-sm overflow-hidden group
                            ${isActive 
                              ? 'bg-blue-600 border-blue-500 text-white shadow-2xl scale-110 -translate-y-4' 
                              : 'bg-white/80 border-white/50 text-gray-800 opacity-60'
                            }
                          `}
                        >
                          {isActive && (
                            <motion.div 
                              layoutId="active-glow"
                              className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent pointer-events-none"
                            />
                          )}

                          <div className="w-full flex justify-between items-start relative z-10">
                            <span className={`font-serif italic text-2xl -ml-[10px] mt-0 ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                              {item.step}
                            </span>
                            <div className={`${isActive ? 'bg-white/20' : 'bg-gray-100'} p-2 rounded-xl transition-colors`}>
                              {isCurrentStep ? <Check className="w-6 h-6 text-current" /> : <ArrowRight className="w-6 h-6 text-gray-400" />}
                            </div>
                          </div>
                          
                          <div className="relative z-10">
                            <h3 className={`text-3xl font-bold mb-4 font-serif italic -ml-[10px] ${isActive ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                            <p className={`text-base leading-relaxed -ml-[10px] mt-0 ${isActive ? 'text-white/80' : 'text-gray-600'}`}>
                              {item.desc}
                            </p>
                            
                            {isCurrentStep && (
                              <motion.button 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={rotateRight}
                                className="mt-0 -ml-[10px] flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-blue-200 transition-colors group/btn"
                              >
                                Volgende stap <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                              </motion.button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  }
                </RadialScrollGallery>
              </div>
            </div>
          </motion.div>
        );
      case 'Prijzen':
        const galleryImages = [
          { src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800", alt: "Data analysis" },
          { src: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800", alt: "Meeting" },
          { src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800", alt: "Laptop with code" },
          { src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800", alt: "Collaboration" },
          { src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800", alt: "Modern office" },
        ];

        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-0 space-y-12 pb-16"
          >
            <div className="relative h-[500px] w-full overflow-hidden">
               <InfiniteGallery 
                images={galleryImages}
                speed={1.5}
                visibleCount={10}
                className="h-full w-full"
                style={{ marginTop: '-26px', marginLeft: '0px' }}
              />
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-start pt-12 text-center px-4">
                <h1 className="text-[11rem] font-serif italic text-gray-900 tracking-tighter select-none">
                  Kies uw <span className="text-white">kracht</span>
                </h1>
                <div className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => setActivePage('Diensten')}
                    className="px-10 py-4 border-2 rounded-full font-bold text-lg bg-white/40 backdrop-blur-md border-white/60 text-gray-900 hover:bg-white/60 transition-all shadow-xl active:scale-95"
                  >
                    Kijk naar onze diensten
                  </button>
                  <button 
                    onClick={() => setActivePage('Contact')}
                    className="px-10 py-4 border-2 rounded-full font-bold text-lg bg-white/40 backdrop-blur-md border-white/60 text-gray-900 hover:bg-white/60 transition-all shadow-xl active:scale-95"
                  >
                    Doe een aanvraag
                  </button>
                </div>
              </div>
            </div>

            <div className="px-16 space-y-12 relative -mt-40 z-10">
              <div className="space-y-4 bg-white/40 backdrop-blur-md p-10 rounded-[3rem] inline-block border border-white/40 shadow-2xl">
                <h1 className="text-7xl font-serif italic text-gray-900 tracking-tight">Prijzen</h1>
                <p className="text-gray-800 max-w-xl text-xl font-medium leading-relaxed">
                  Scherpe en transparante prijzen om uw bedrijf digitaal zichtbaar te maken, begin bij de basis en breidt it wanneer u wilt.
                </p>
              </div>
            </div>

            <div className="space-y-12">
              {/* Basis Pakket - Full Width */}
              <div 
                className="bg-white/40 backdrop-blur-md p-16 rounded-[40px] shadow-2xl border border-white/40 relative overflow-hidden group"
                style={{ height: '396px', width: '1146px', marginLeft: '64px' }}
              >
                <div className="grid grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-4xl font-serif italic text-gray-900">Basis Site</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-bold text-gray-900">€250</span>
                        <span className="text-gray-500 text-lg">eenmalig excl. 21% btw.</span>
                      </div>
                    </div>
                    <p className="text-gray-600">De perfecte start om online zichtbaar te worden met een site, uw klanten te helpen en een plek te hebben waar alles samen komt.</p>
                    <button 
                      onClick={() => setActivePage('Calculator')}
                      className="w-auto px-12 py-4 border-2 rounded-full font-bold text-xl bg-white/40 backdrop-blur-md border-white/60 text-gray-900 hover:bg-white/60 transition-all shadow-sm active:scale-95"
                    >
                      Kijk wat voor site ik nodig heb
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {[
                      'Een mooi design, passend bij uw bedrijf',
                      'Tot 10 pagina’s',
                      'Ruimte voor koppelingen en links',
                      'Een database tot 1GB opslag',
                      'Mooie elementen op uw site',
                      'Mogelijkheid tot uitbreiden'
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-gray-700 list-none">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </div>
                </div>
              </div>

              <div 
                className="bg-white/40 backdrop-blur-md p-8 md:p-12 rounded-[40px] shadow-xl border border-white/40"
                style={{ width: '1146px', marginLeft: '61px' }}
              >
                <h3 className="text-2xl font-serif italic text-gray-900 mb-6">Extra Opties</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b border-gray-100">
                    <AccordionTrigger className="text-lg hover:no-underline hover:text-blue-600">AI Chatbot — € 60 eenmalig excl. btw</AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      Wilt u uw klanten een eerste vraagbaak geven, dan komt een AI-Chatbot van pas. Deze Chatbot geeft antwoord op vragen van klanten met enkel de gegevens die zichtbaar zijn op uw site.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-b border-gray-100">
                    <AccordionTrigger className="text-lg hover:no-underline hover:text-blue-600">Webshop — € 200 eenmalig excl. btw</AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      Wilt u uw producten een thuis geven op uw site? Wij maken het mogelijk, als klanten ook moeten kunnen afrekenen en hun order moeten kunnen plaatsen komen hier extra kosten bij. Voor opslag betaalt u maandelijks meer.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" className="border-b border-gray-100">
                    <AccordionTrigger className="text-lg hover:no-underline hover:text-blue-600">Extra pagina — € 60 p.s. excl. btw</AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      Wilt u nou nog meer weergeven op uw site? Wij maken het mogelijk.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4" className="border-b border-gray-100">
                    <AccordionTrigger className="text-lg hover:no-underline hover:text-blue-600">Logo en huisstijl ontwerpen — € 75 eenmalig excl. btw</AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      Wilt u op al uw platformen zichtbaar worden? Wij helpen u graag verder door uw logo en huisstijl te ontwerpen. Wij doen ook enkel logo en huisstijl designs. Dat hoeft niet samen te gaan met een site.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5" className="border-b border-gray-100">
                    <AccordionTrigger className="text-lg hover:no-underline hover:text-blue-600">Extra database opslag — in overleg</AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      Wilt u extra opslag op uw site, om een intranet of webshop optimaal te gebruiken? Geen probleem we helpen u verder.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-6" className="border-none">
                    <AccordionTrigger className="text-lg hover:no-underline hover:text-blue-600">Domein aankopen - in overleg</AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      Wilt u een eigen domein gebruiken? Geen probleem, mocht u deze niet hebben kunnen wij deze aankopen en beheren.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
        </motion.div>
        );
      case 'Calculator':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 space-y-4 max-w-5xl mx-auto"
          >
            <button 
              onClick={() => setActivePage('Prijzen')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold">Terug naar prijzen</span>
            </button>

            <div className="grid grid-cols-2 gap-12 items-start pt-4">
              <div className="space-y-6">
                <h1 className="text-6xl font-serif italic text-gray-900 leading-tight">Vind uw perfecte match</h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Beantwoord een paar korte vragen en ontdek direct welk pakket en welke uitbreidingen het beste passen bij uw visie en budget.
                </p>
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">!</div>
                  <p className="text-sm text-blue-800 font-medium leading-relaxed">
                    Alle prijzen zijn indicatief. Na de berekening kunnen we samen kijken naar een definitieve offerte op maat.
                  </p>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-12 rounded-[48px] shadow-2xl">
                <div className="mb-8 border-b border-white/20 pb-6 text-center">
                  <h3 className="text-4xl font-serif italic mb-2 text-gray-900">Ontdek uw ideale site</h3>
                  <p className="text-gray-600 font-medium">Loop door de stappen en vind de perfecte match.</p>
                </div>
                <InteractiveQuiz />
              </div>
            </div>
          </motion.div>
        );
      case 'Over ons':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-0 space-y-8 w-full"
          >
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 pt-16">
              <div className="text-center">
                <h1 
                  className="text-[10rem] font-serif italic text-gray-900 tracking-tighter leading-none"
                  style={{ marginTop: `-232px` }}
                >
                  Waar we voor <span className="text-white">staan</span>
                </h1>
              </div>
              <button 
                onClick={() => setActivePage('Contact')}
                className="h-14 gap-4 rounded-full px-10 border-2 font-bold text-lg bg-white/40 backdrop-blur-md border-white/60 text-gray-900 hover:bg-white/60 transition-all shadow-xl active:scale-95 flex items-center justify-center group"
                style={{ marginTop: '-84px' }}
              >
                Neem contact op <MoveRight className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="px-16 space-y-8 pb-16 w-full max-w-6xl">
              <div className="max-w-4xl space-y-8">
                <div className="flex flex-row justify-between items-start gap-8">
                  <div className="space-y-6 flex-1" style={{ marginTop: '-161px' }}>
                    <h1 
                      className="text-6xl font-serif italic text-gray-900"
                      style={{ marginLeft: '0px' }}
                    >
                      Over WebGen
                    </h1>
                    <p className="text-2xl text-gray-700 leading-relaxed">
                      Wij zijn WebGen, wij staan voor een goed zichtbaar bedrijf online. Van Website tot vormgeving en loog’s. Een brug tussen functionaliteit en elegantie. Samen voor de nieuwe generatie websites.
                    </p>
                  </div>
                </div>
                <div 
                  className="bg-[#aebdc2]/30 p-8 rounded-[40px] text-gray-800 italic font-serif text-xl leading-relaxed"
                  style={{ width: '1134px' }}
                >
                  "Wij staan er om bedrijven meer zichtbaar te maken op het web. Zo kunt u optimaal ondernemen."
                </div>
              </div>

              <div className="mt-32 relative">
                <div className="absolute -top-24 right-0 md:right-8 w-40 h-60 md:w-64 md:h-96 z-10">
                  <img 
                    src="https://i.postimg.cc/Y9FB80Ng/IMG-4184-removebg-preview.png" 
                    alt="Stijn van Lier" 
                    className="w-full h-full object-contain rounded-none transform hover:scale-105 transition-transform duration-300"
                    style={{ marginTop: '20px', marginLeft: '139px', width: '270px', height: '383px' }}
                  />
                </div>
                <div 
                  className="bg-[#aebdc2]/30 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-[48px] shadow-2xl relative overflow-hidden group"
                  style={{ width: '1134px', marginLeft: '0px', marginTop: '-106px' }}
                >
                  <div className="space-y-3">
                    <h3 className="text-3xl md:text-5xl font-serif italic text-gray-900 leading-none">Stijn van Lier</h3>
                    <p className="text-gray-900 font-bold tracking-[0.2em] uppercase text-sm">Founder en WebDesigner</p>
                  </div>
                  <div 
                    className="mt-8 text-gray-700 text-lg md:text-xl leading-relaxed font-medium"
                    style={{ width: '800px', height: '97.5px', marginTop: '10px' }}
                  >
                    Door een interesse in webdesign en ontwerpen ben ik begonnen met het idee om hier anderen in te gaan helpen, de geboorte van WebGen.
                  </div>
                </div>
              </div>
            </div>
            <AboutUsGallery onNavigate={setActivePage} />
          </motion.div>
        );
      case 'Contact':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto py-12 px-8"
          >
            <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[48px] shadow-2xl overflow-hidden">
              <ContactForm />
            </div>
            <div className="mt-12 text-center">
              <p className="text-gray-500 font-medium uppercase tracking-widest text-xs mb-2">Direct contact</p>
              <a 
                href="mailto:info@webgen.nu" 
                className="text-xl md:text-2xl font-serif italic text-gray-900 hover:text-blue-600 transition-colors"
              >
                info@webgen.nu
              </a>
            </div>
          </motion.div>
        );
      case 'Portaal':
        return user ? (
          <CustomerDashboard user={user} onLogout={handleLogout} />
        ) : (
          <div className="min-h-[550px] flex flex-col items-center justify-center py-16 px-8">
            <div className="bg-white/40 backdrop-blur-md p-10 md:p-12 rounded-[40px] border border-white/40 shadow-2xl max-w-md w-full space-y-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-pulse">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-serif italic text-[#1e293b]">
                  Medewerkers Portaal
                </h3>
                <p className="text-gray-600 font-medium text-sm leading-relaxed">
                  Vul uw e-mailadres en wachtwoord in om WebGen projecten live te beheren.
                </p>
              </div>

              {authError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-semibold text-xs text-center leading-relaxed">
                  {authError}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-5 text-left">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">E-mailadres</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E.g., medewerker@webgen.nl"
                    className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium shadow-sm transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Wachtwoord</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-5 pr-12 py-4 bg-white border border-gray-100 rounded-2xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium shadow-sm transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  id="email-auth-btn"
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 text-base cursor-pointer mt-2"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Inloggen
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <Hero onNavigate={setActivePage} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-start justify-center font-sans overflow-x-hidden">
      <div 
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top center',
          width: '1440px',
          flexShrink: 0
        }}
      >
        <motion.div 
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full min-h-[130vh] bg-[#d0e1f9] rounded-[64px] overflow-hidden flex flex-col relative shadow-2xl border border-[#b8cce4]"
        >
        {/* Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col p-12 md:p-20"
            >
              <div className="flex justify-between items-center mb-16">
                <span className="font-serif italic text-3xl font-semibold text-gray-900">Menu</span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              <nav className="flex flex-col gap-6">
                {pages.filter(p => p !== 'Calculator').map((page, index) => (
                  <motion.button
                    key={page}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setActivePage(page);
                      setIsMenuOpen(false);
                    }}
                    className={`text-4xl md:text-7xl font-serif italic text-left transition-all ${
                      activePage === page ? 'text-blue-600 translate-x-4' : 'text-gray-400 hover:text-gray-900 hover:translate-x-2'
                    }`}
                  >
                    {page}
                  </motion.button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <div className="bg-[#aebdc2] px-10 py-8 flex items-center justify-between gap-4 sticky top-0 z-40">
          <div 
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm cursor-pointer hover:bg-gray-50 transition-all active:scale-95 group"
          >
            <Menu className="w-5 h-5 text-gray-700 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-bold text-gray-900 text-lg">{activePage}</span>
          </div>

          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Zoeken..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => handleSearch(searchQuery)}
                className="w-full bg-white h-12 pl-12 pr-4 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
              />
              
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-blue-50 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      {searchResults.map((result) => (
                        <button
                          key={result.page}
                          onClick={() => {
                            setActivePage(result.page);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                          className="w-full flex items-center justify-between p-4 hover:bg-blue-50 rounded-2xl transition-all group text-left"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{result.page}</span>
                            <span className="text-xs text-blue-600/60 font-medium">Bezoek pagina</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Elegant Login button with lock/unlock icon */}
            <button
              id="login-btn-header"
              onClick={() => {
                setActivePage('Portaal');
              }}
              className="px-6 py-2.5 bg-white hover:bg-gray-50 border border-white text-gray-900 font-bold rounded-full transition-all flex items-center gap-2 shadow-md text-sm active:scale-95 cursor-pointer"
            >
              {user ? (
                <>
                  <Unlock className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>Portaal ({user.displayName?.split(" ")[0] || "U"})</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-red-600" />
                  <span>Inloggen</span>
                </>
              )}
            </button>

            <div 
              onClick={() => {
                setActivePage('Home');
                setIsMenuOpen(false);
              }}
              className="cursor-pointer"
            >
              <span className="font-serif italic text-3xl font-semibold text-white tracking-tight hover:text-blue-50 transition-colors">
                WebGen
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activePage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Section */}
          <div className="mt-12" style={{ marginTop: '-22px' }}>
            <div 
              className="bg-white/40 backdrop-blur-md rounded-[64px] border-t border-white/40 px-16 py-16 shadow-2xl relative overflow-hidden"
              style={{ 
                marginTop: '0px',
                minHeight: '320px',
                width: '100%',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              
              <div className="relative z-10 grid grid-cols-4 gap-8 max-w-7xl mx-auto">
                {/* Branding Column */}
                <div className="space-y-6" style={{ marginTop: '-25px' }}>
                  <div className="flex flex-col gap-1">
                    <span className="font-serif italic text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                      WebGen
                    </span>
                    <span className="text-sm md:text-base font-medium text-gray-600">
                      De nieuwe generatie websites.
                    </span>
                  </div>
                  <div className="pt-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
                      Alle rechten voorhouden
                    </span>
                    <span className="text-[10px] md:text-xs font-medium text-gray-400 mt-2 block">
                      Powered by WebGen
                    </span>
                  </div>
                </div>

                {/* Navigation Column */}
                <div className="space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900" style={{ marginTop: '-11px' }}>Navigatie</h4>
                  <ul className="flex flex-col gap-4">
                    {['Home', 'Diensten', 'Prijzen', 'Over ons', 'Contact'].map((item) => (
                      <li key={item}>
                        <button 
                          onClick={() => setActivePage(item as Page)}
                          className="text-sm md:text-base text-gray-600 hover:text-blue-600 transition-colors font-medium text-left"
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Socials Column */}
                <div className="space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900" style={{ marginTop: '-10px' }}>Social Media</h4>
                  <ul className="flex flex-col gap-4">
                    <li>
                      <a href="https://www.instagram.com/webgen.nu?igsh=MTlqYWY2ZHBma3h2OQ==" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-gray-600 hover:text-blue-600 transition-colors font-medium">Instagram</a>
                    </li>
                    <li>
                      <a href="https://www.linkedin.com/company/webgen-nu/" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-gray-600 hover:text-blue-600 transition-colors font-medium">LinkedIn</a>
                    </li>
                    <li>
                      <a href="#" className="text-sm md:text-base text-gray-600 hover:text-blue-600 transition-colors font-medium">Whatsapp</a>
                    </li>
                  </ul>
                </div>

                {/* Legal Column */}
                <div className="space-y-6" style={{ marginTop: '-10px' }}>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900">Overig</h4>
                  <ul className="flex flex-col gap-4">
                    <li>
                      <a href="https://1drv.ms/w/c/802E37A4B2885CC5/IQDGqyxflbw_T41jNRbcfPJkAbkjXERC5_bvxf2ABHrazrA" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-gray-600 hover:text-blue-600 transition-colors font-medium">Policy</a>
                    </li>
                    <li>
                      <a href="https://1drv.ms/w/c/802E37A4B2885CC5/IQAPxnITg57-RIOZURo6z2h-AW4SzC7bGfXRPtFoILhDTXw" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-gray-600 hover:text-blue-600 transition-colors font-medium">Prijzenlijst</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
  );
}


