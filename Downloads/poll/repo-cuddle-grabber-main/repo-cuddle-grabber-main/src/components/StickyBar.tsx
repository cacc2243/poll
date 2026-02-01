import { LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import lovapoolLogoSmall from "@/assets/lovapool-logo-small.png";
import lovableColorIcon from "@/assets/lovable-color-icon.png";
import v0IconWhite from "@/assets/v0-icon-white.png";
import manusIcon from "@/assets/ico-manus-2.png";

interface StickyBarProps {
  onOpenAuth?: () => void;
}

const StickyBar = ({ onOpenAuth }: StickyBarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenAuth = () => {
    if (onOpenAuth) {
      onOpenAuth();
    }
  };

  return (
    <>
      {/* Glow light effect attached to top bar */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        style={{
          width: '500px',
          height: '200px',
          background: 'radial-gradient(ellipse 100% 100% at 50% 0%, hsl(0 70% 50% / 0.4) 0%, hsl(0 65% 45% / 0.15) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      
      <div 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: isScrolled 
            ? 'linear-gradient(135deg, rgba(197, 48, 48, 0.35) 0%, rgba(155, 44, 44, 0.25) 50%, rgba(220, 80, 80, 0.3) 100%)' 
            : 'linear-gradient(135deg, #c53030 0%, #9b2c2c 40%, #e53e3e 70%, #f56565 100%)',
          backdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
          boxShadow: isScrolled 
            ? '0 4px 30px rgba(197, 48, 48, 0.15)' 
            : '0 2px 20px rgba(197, 48, 48, 0.3)',
        }}
      >
      <div className="container py-2">
        <div className="flex items-center justify-center gap-2">
          {isScrolled ? (
            <div className="flex items-center justify-between w-full max-w-md">
              <img 
                src={lovapoolLogoSmall} 
                alt="LovaPool" 
                className="h-7 w-auto"
              />
              <button 
                onClick={handleOpenAuth}
                className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <LogIn className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">
                  Área de membros
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-white font-medium">
              <img src={lovableColorIcon} alt="Lovable" className="w-5 h-5 object-contain" />
              <span>Lovable Ilimitado</span>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default StickyBar;
