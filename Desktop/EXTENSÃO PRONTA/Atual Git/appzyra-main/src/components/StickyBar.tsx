import { Puzzle, LogIn } from "lucide-react";
import { useState, useEffect } from "react";

const StickyBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Glow light effect attached to top bar */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        style={{
          width: '500px',
          height: '200px',
          background: 'radial-gradient(ellipse 100% 100% at 50% 0%, hsl(252 80% 65% / 0.4) 0%, hsl(254 70% 60% / 0.15) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      
      <div 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: isScrolled 
            ? 'linear-gradient(135deg, rgba(128, 101, 243, 0.35) 0%, rgba(109, 78, 216, 0.25) 50%, rgba(168, 147, 249, 0.3) 100%)' 
            : 'linear-gradient(135deg, #8065f3 0%, #6d4ed8 40%, #9b7bf7 70%, #a893f9 100%)',
          backdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
          boxShadow: isScrolled 
            ? '0 4px 30px rgba(128, 101, 243, 0.15)' 
            : '0 2px 20px rgba(128, 101, 243, 0.3)',
        }}
      >
      <div className="container py-2">
        <div className="flex items-center justify-center gap-2">
          {isScrolled ? (
            <a 
              href="/lov-acesso" 
              className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <LogIn className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                Acesse a área de membros
              </span>
            </a>
          ) : (
            <>
              <Puzzle className="w-4 h-4 text-white" />
              <p className="sm:text-sm font-light text-sm text-white">
                O ÚNICO 100% FUNCIONAL
              </p>
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default StickyBar;
