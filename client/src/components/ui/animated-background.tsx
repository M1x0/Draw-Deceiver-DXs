import { useMemo } from "react";

const AnimatedBackground = () => {
  const stars = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B2838] via-[#2A3F5F] to-[#1B2838] animate-gradient-shift"></div>
      
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-float-slow"></div>
        <div className="absolute top-[60%] right-[15%] w-80 h-80 bg-accent/20 rounded-full blur-[100px] animate-float-slower"></div>
        <div className="absolute bottom-[10%] left-[30%] w-72 h-72 bg-purple-500/20 rounded-full blur-[90px] animate-float"></div>
        <div className="absolute top-[40%] right-[40%] w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px] animate-float-slow"></div>
      </div>

      <div className="absolute inset-0 opacity-20">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-2 h-2 bg-white rounded-full animate-twinkle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 backdrop-blur-[1px]"></div>
    </div>
  );
};

export default AnimatedBackground;
