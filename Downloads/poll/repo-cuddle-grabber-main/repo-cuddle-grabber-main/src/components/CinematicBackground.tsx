import { useEffect, useRef } from 'react';

const CinematicBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subtle parallax effect on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xOffset = (clientX / innerWidth - 0.5) * 8;
      const yOffset = (clientY / innerHeight - 0.5) * 8;
      
      const lights = containerRef.current.querySelectorAll('.volumetric-light');
      lights.forEach((light, index) => {
        const element = light as HTMLElement;
        const multiplier = (index + 1) * 0.3;
        element.style.transform = `translate(${xOffset * multiplier}px, ${yOffset * multiplier}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, overflow: 'hidden', maxWidth: '100vw' }}>
      {/* Base layer - deep near-black with red undertone */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 130% 90% at 50% 0%, 
              hsl(0 40% 10% / 1) 0%, 
              hsl(0 30% 6% / 1) 35%, 
              hsl(0 20% 3% / 1) 100%
            )
          `,
        }}
      />

      {/* Layered darkness - ambient occlusion inspired */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% 100%, 
              hsl(0 50% 4% / 0.95) 0%, 
              transparent 65%
            ),
            radial-gradient(ellipse 70% 60% at 0% 50%, 
              hsl(0 50% 4% / 0.8) 0%, 
              transparent 55%
            ),
            radial-gradient(ellipse 70% 60% at 100% 50%, 
              hsl(0 50% 4% / 0.8) 0%, 
              transparent 55%
            )
          `,
        }}
      />

      {/* Volumetric light accent - top center - red glow */}
      <div 
        className="volumetric-light absolute transition-transform duration-[2000ms] ease-out"
        style={{
          top: '-5%',
          left: '20%',
          width: '60%',
          height: '70%',
          background: `
            radial-gradient(ellipse 100% 100% at 50% 0%, 
              hsl(0 70% 50% / 0.30) 0%, 
              hsl(0 65% 40% / 0.12) 40%, 
              transparent 70%
            )
          `,
          filter: 'blur(60px)',
        }}
      />

      {/* Volumetric light accent - left side */}
      <div 
        className="volumetric-light absolute transition-transform duration-[2500ms] ease-out"
        style={{
          top: '10%',
          left: '-10%',
          width: '50%',
          height: '60%',
          background: `
            radial-gradient(ellipse 100% 100% at 0% 50%, 
              hsl(0 65% 45% / 0.20) 0%, 
              transparent 55%
            )
          `,
          filter: 'blur(70px)',
        }}
      />

      {/* Volumetric light accent - right side */}
      <div 
        className="volumetric-light absolute transition-transform duration-[2200ms] ease-out"
        style={{
          top: '30%',
          right: '-10%',
          width: '45%',
          height: '55%',
          background: `
            radial-gradient(ellipse 100% 100% at 100% 50%, 
              hsl(0 55% 42% / 0.18) 0%, 
              transparent 55%
            )
          `,
          filter: 'blur(65px)',
        }}
      />

      {/* Additional volumetric glow - bottom center */}
      <div 
        className="volumetric-light absolute transition-transform duration-[2800ms] ease-out"
        style={{
          bottom: '-10%',
          left: '30%',
          width: '40%',
          height: '50%',
          background: `
            radial-gradient(ellipse 100% 100% at 50% 100%, 
              hsl(0 60% 45% / 0.14) 0%, 
              transparent 60%
            )
          `,
          filter: 'blur(60px)',
        }}
      />

      {/* Soft rim light glow - top sections */}
      <div 
        className="absolute"
        style={{
          top: '3%',
          left: '15%',
          width: '70%',
          height: '4px',
          background: `
            linear-gradient(90deg, 
              transparent 0%, 
              hsl(0 70% 55% / 0.25) 25%, 
              hsl(0 70% 60% / 0.40) 50%, 
              hsl(0 70% 55% / 0.25) 75%, 
              transparent 100%
            )
          `,
          filter: 'blur(15px)',
        }}
      />

      {/* Additional rim light - mid page */}
      <div 
        className="absolute"
        style={{
          top: '45%',
          left: '10%',
          width: '80%',
          height: '3px',
          background: `
            linear-gradient(90deg, 
              transparent 0%, 
              hsl(0 60% 50% / 0.10) 30%, 
              hsl(0 60% 50% / 0.18) 50%, 
              hsl(0 60% 50% / 0.10) 70%, 
              transparent 100%
            )
          `,
          filter: 'blur(20px)',
        }}
      />

      {/* Bokeh particles - red tones */}
      <div className="absolute inset-0">
        {/* Top left corner */}
        <div 
          className="absolute animate-bokeh-drift-1"
          style={{
            top: '8%',
            left: '5%',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: 'hsl(0 70% 65% / 0.5)',
            filter: 'blur(3px)',
            boxShadow: '0 0 25px 10px hsl(0 70% 60% / 0.30)',
          }}
        />
        <div 
          className="absolute animate-bokeh-drift-2"
          style={{
            top: '15%',
            left: '12%',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'hsl(0 60% 60% / 0.45)',
            filter: 'blur(2px)',
            boxShadow: '0 0 18px 6px hsl(0 60% 55% / 0.25)',
          }}
        />
        
        {/* Top right corner */}
        <div 
          className="absolute animate-bokeh-drift-3"
          style={{
            top: '6%',
            right: '8%',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'hsl(0 65% 62% / 0.30)',
            filter: 'blur(3.5px)',
            boxShadow: '0 0 30px 12px hsl(0 65% 58% / 0.15)',
          }}
        />
        <div 
          className="absolute animate-bokeh-drift-1"
          style={{
            top: '18%',
            right: '15%',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'hsl(0 70% 65% / 0.25)',
            filter: 'blur(2px)',
            boxShadow: '0 0 15px 5px hsl(0 70% 60% / 0.12)',
          }}
        />

        {/* Bottom left */}
        <div 
          className="absolute animate-bokeh-drift-2"
          style={{
            bottom: '15%',
            left: '8%',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'hsl(0 60% 60% / 0.30)',
            filter: 'blur(2.5px)',
            boxShadow: '0 0 20px 8px hsl(0 60% 55% / 0.15)',
          }}
        />

        {/* Bottom right */}
        <div 
          className="absolute animate-bokeh-drift-3"
          style={{
            bottom: '10%',
            right: '6%',
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            background: 'hsl(0 65% 62% / 0.32)',
            filter: 'blur(3px)',
            boxShadow: '0 0 25px 10px hsl(0 65% 58% / 0.16)',
          }}
        />

        {/* Mid section particles */}
        <div 
          className="absolute animate-bokeh-drift-1"
          style={{
            top: '35%',
            left: '3%',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'hsl(0 55% 58% / 0.25)',
            filter: 'blur(2px)',
            boxShadow: '0 0 15px 5px hsl(0 55% 55% / 0.12)',
          }}
        />
        <div 
          className="absolute animate-bokeh-drift-2"
          style={{
            top: '55%',
            right: '4%',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: 'hsl(0 65% 60% / 0.30)',
            filter: 'blur(3px)',
            boxShadow: '0 0 22px 8px hsl(0 65% 56% / 0.15)',
          }}
        />
        
        {/* Additional particles for more depth */}
        <div 
          className="absolute animate-bokeh-drift-3"
          style={{
            top: '45%',
            left: '92%',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: 'hsl(0 55% 58% / 0.22)',
            filter: 'blur(1.5px)',
            boxShadow: '0 0 12px 4px hsl(0 55% 55% / 0.10)',
          }}
        />
        <div 
          className="absolute animate-bokeh-drift-1"
          style={{
            top: '70%',
            left: '6%',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'hsl(0 60% 60% / 0.28)',
            filter: 'blur(2px)',
            boxShadow: '0 0 18px 6px hsl(0 60% 56% / 0.12)',
          }}
        />
        
        {/* Extra corner accents */}
        <div 
          className="absolute animate-bokeh-drift-2"
          style={{
            top: '25%',
            left: '2%',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'hsl(0 55% 58% / 0.20)',
            filter: 'blur(1.5px)',
          }}
        />
        <div 
          className="absolute animate-bokeh-drift-3"
          style={{
            top: '80%',
            right: '10%',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'hsl(0 60% 60% / 0.25)',
            filter: 'blur(2px)',
            boxShadow: '0 0 14px 5px hsl(0 60% 56% / 0.10)',
          }}
        />
      </div>

      {/* Vignette overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 65% 55% at 50% 50%, 
              transparent 0%, 
              hsl(0 30% 2% / 0.5) 65%, 
              hsl(0 30% 1% / 0.85) 100%
            )
          `,
        }}
      />

      {/* Subtle grid texture - gradient faded */}
      <div 
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(0 60% 50%) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(0 60% 50%) 1px, transparent 1px)
          `,
          backgroundSize: '45px 45px',
          maskImage: `
            radial-gradient(ellipse 95% 85% at 50% 50%, 
              black 0%, 
              transparent 70%
            )
          `,
          WebkitMaskImage: `
            radial-gradient(ellipse 95% 85% at 50% 50%, 
              black 0%, 
              transparent 70%
            )
          `,
        }}
      />

      {/* Film grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay animate-grain"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
        }}
      />
    </div>
  );
};

export default CinematicBackground;
