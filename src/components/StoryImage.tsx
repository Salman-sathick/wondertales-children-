import React, { useState } from 'react';

export type StoryIllustrationType =
  | 'dragon'
  | 'bear'
  | 'turtle'
  | 'pegasus'
  | 'hero'
  | 'puppy'
  | 'bunny'
  | 'dino';

interface StoryImageProps {
  src?: string;
  alt: string;
  type?: StoryIllustrationType;
  className?: string;
  interactiveSparkles?: boolean;
}

export const StoryImage: React.FC<StoryImageProps> = ({
  src,
  alt,
  type = 'dragon',
  className = 'w-full h-full object-cover',
  interactiveSparkles = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  // Reset loaded/error states when src changes
  React.useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // Auto-detect type if not explicitly passed
  let illustrationType = type;
  const lowerAlt = (alt || '').toLowerCase();
  const lowerSrc = (src || '').toLowerCase();

  if (lowerAlt.includes('bear') || lowerSrc.includes('bear')) {
    illustrationType = 'bear';
  } else if (lowerAlt.includes('turtle') || lowerAlt.includes('reef') || lowerSrc.includes('turtle')) {
    illustrationType = 'turtle';
  } else if (lowerAlt.includes('pegasus') || lowerSrc.includes('pegasus') || lowerAlt.includes('pony')) {
    illustrationType = 'pegasus';
  } else if (lowerAlt.includes('dragon') || lowerAlt.includes('pip') || lowerSrc.includes('dragon') || lowerSrc.includes('pip')) {
    illustrationType = 'dragon';
  } else if (lowerAlt.includes('bunny') || lowerAlt.includes('oliver') || lowerSrc.includes('bunny') || lowerSrc.includes('oliver')) {
    illustrationType = 'bunny';
  } else if (lowerAlt.includes('dino') || lowerSrc.includes('dino')) {
    illustrationType = 'dino';
  } else if (lowerAlt.includes('bedtime') || lowerAlt.includes('hero') || lowerSrc.includes('hero')) {
    illustrationType = 'hero';
  } else if (lowerAlt.includes('puppy') || lowerAlt.includes('adventure') || lowerSrc.includes('custom')) {
    illustrationType = 'puppy';
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactiveSparkles) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const emojis = ['⭐', '✨', '💖', '🌟', '🎈', '🌈'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const newSparkle = { id: Date.now() + Math.random(), x, y, emoji: randomEmoji };
    setSparkles((prev) => [...prev.slice(-6), newSparkle]);

    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
    }, 900);
  };

  return (
    <div
      role="img"
      aria-label={alt}
      className="relative w-full h-full overflow-hidden select-none cursor-pointer bg-amber-50/50"
      onPointerDown={handlePointerDown}
    >
      {/* 1. Bulletproof SVG Vector Illustration: ALWAYS present, zero broken icon risk */}
      <div className="w-full h-full flex items-center justify-center">
        {illustrationType === 'dragon' && <DragonIllustration />}
        {illustrationType === 'bear' && <BearIllustration />}
        {illustrationType === 'turtle' && <TurtleIllustration />}
        {illustrationType === 'pegasus' && <PegasusIllustration />}
        {illustrationType === 'hero' && <HeroIllustration />}
        {illustrationType === 'puppy' && <PuppyIllustration />}
        {illustrationType === 'bunny' && <BunnyIllustration />}
        {illustrationType === 'dino' && <DinoIllustration />}
      </div>

      {/* 2. Primary Image: Smoothly fades in over the SVG ONLY once loaded */}
      {src && !hasError && (
        <img
          src={src}
          alt=""
          role="presentation"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 ${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          loading="eager"
        />
      )}

      {/* 3. Floating Sparkles when tapped by toddler */}
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute pointer-events-none text-2xl sm:text-3xl animate-bounce"
          style={{
            left: s.x - 14,
            top: s.y - 14,
            animationDuration: '0.8s',
            filter: 'drop-shadow(0 2px 8px rgba(251,191,36,0.6))',
          }}
        >
          {s.emoji}
        </span>
      ))}
    </div>
  );
};

// 1. Pip the Baby Dragon & Happy Star
const DragonIllustration: React.FC = () => (
  <svg viewBox="0 0 600 450" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="60%" stopColor="#312e81" />
        <stop offset="100%" stopColor="#4338ca" />
      </linearGradient>
      <linearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#facc15" />
      </linearGradient>
      <linearGradient id="dragonGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fb7185" />
        <stop offset="50%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#e11d48" />
      </linearGradient>
      <linearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef9c3" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>

    {/* Night Sky */}
    <rect width="600" height="450" fill="url(#skyGrad)" />

    {/* Soft Constellation Dots & Lines */}
    <g opacity="0.4" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 3">
      <line x1="60" y1="60" x2="110" y2="90" />
      <line x1="110" y1="90" x2="170" y2="70" />
      <line x1="480" y1="80" x2="540" y2="120" />
      <line x1="540" y1="120" x2="510" y2="170" />
    </g>

    {/* Twinkling Stars */}
    <circle cx="80" cy="70" r="3" fill="#ffffff" />
    <circle cx="160" cy="65" r="4" fill="#fef08a" />
    <circle cx="480" cy="75" r="3.5" fill="#fef08a" />
    <circle cx="530" cy="115" r="3" fill="#ffffff" />
    <circle cx="90" cy="380" r="4" fill="#fef08a" />
    <circle cx="520" cy="360" r="3.5" fill="#fef08a" />

    {/* Giant Smiling Crescent Moon */}
    <path
      d="M210 50 C320 50 370 170 370 270 C370 350 310 400 230 400 C330 380 340 130 210 50 Z"
      fill="url(#moonGrad)"
      filter="drop-shadow(0 0 16px rgba(254, 240, 138, 0.4))"
    />
    {/* Moon Face */}
    <path d="M295 210 Q305 220 315 210" stroke="#854d0e" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="285" cy="195" r="4" fill="#854d0e" />
    <circle cx="325" cy="195" r="4" fill="#854d0e" />
    <circle cx="275" cy="215" r="8" fill="#fde047" opacity="0.6" />
    <circle cx="335" cy="215" r="8" fill="#fde047" opacity="0.6" />

    {/* Clouds at Bottom */}
    <g fill="#4338ca" opacity="0.7">
      <circle cx="120" cy="440" r="90" />
      <circle cx="280" cy="460" r="100" />
      <circle cx="460" cy="440" r="95" />
    </g>

    {/* Pip the Cute Baby Dragon */}
    <g transform="translate(250, 150)">
      {/* Baby Wings */}
      <path d="M70 120 C110 80 130 110 115 145 C100 135 85 130 70 140 Z" fill="#fda4af" />
      <path d="M-10 120 C-50 80 -70 110 -55 145 C-40 135 -25 130 -10 140 Z" fill="#fda4af" />

      {/* Dragon Tail */}
      <path d="M10 190 Q-20 220 10 230 Q25 210 25 190 Z" fill="url(#dragonGrad)" />

      {/* Dragon Body */}
      <ellipse cx="30" cy="155" rx="55" ry="60" fill="url(#dragonGrad)" />
      {/* Tummy */}
      <ellipse cx="30" cy="165" rx="35" ry="40" fill="#fecdd3" />

      {/* Dragon Head */}
      <circle cx="30" cy="85" r="50" fill="url(#dragonGrad)" />

      {/* Tiny Horns */}
      <polygon points="5,45 15,20 25,43" fill="#fef08a" />
      <polygon points="35,43 45,20 55,45" fill="#fef08a" />

      {/* Big Cute Eyes */}
      <ellipse cx="12" cy="80" rx="10" ry="14" fill="#1e1b4b" />
      <circle cx="9" cy="74" r="4.5" fill="#ffffff" />
      <circle cx="14" cy="84" r="2" fill="#ffffff" />

      <ellipse cx="48" cy="80" rx="10" ry="14" fill="#1e1b4b" />
      <circle cx="45" cy="74" r="4.5" fill="#ffffff" />
      <circle cx="50" cy="84" r="2" fill="#ffffff" />

      {/* Cheeks */}
      <ellipse cx="0" cy="98" rx="8" ry="5" fill="#fda4af" />
      <ellipse cx="60" cy="98" rx="8" ry="5" fill="#fda4af" />

      {/* Sweet Smile */}
      <path d="M20 98 Q30 110 40 98" stroke="#881337" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Paws Hugging Star */}
      <ellipse cx="0" cy="155" rx="14" ry="10" fill="#f43f5e" />
      <ellipse cx="60" cy="155" rx="14" ry="10" fill="#f43f5e" />

      {/* Glowing Smiling Baby Star */}
      <g transform="translate(10, 135) scale(0.65)">
        <polygon
          points="25,0 32,15 49,18 37,30 40,47 25,39 9,47 13,30 1,18 17,15"
          fill="url(#starGrad)"
          filter="drop-shadow(0 0 10px rgba(254,240,138,0.9))"
        />
        {/* Star Face */}
        <circle cx="20" cy="22" r="2.5" fill="#78350f" />
        <circle cx="30" cy="22" r="2.5" fill="#78350f" />
        <path d="M22 28 Q25 32 28 28" stroke="#78350f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

// 2. Barnaby the Fluffy Teddy Bear Baker
const BearIllustration: React.FC = () => (
  <svg viewBox="0 0 600 450" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bakeryBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="100%" stopColor="#ffedd5" />
      </linearGradient>
      <linearGradient id="bearFur" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="cupcakeIcing" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>

    {/* Warm Cozy Bakery Wall */}
    <rect width="600" height="450" fill="url(#bakeryBg)" />

    {/* Sunlit Window */}
    <rect x="400" y="40" width="160" height="180" rx="16" fill="#e0f2fe" stroke="#fed7aa" strokeWidth="8" />
    <line x1="480" y1="40" x2="480" y2="220" stroke="#fed7aa" strokeWidth="6" />
    <line x1="400" y1="130" x2="560" y2="130" stroke="#fed7aa" strokeWidth="6" />
    {/* Smiling Sun in Window */}
    <circle cx="510" cy="90" r="28" fill="#facc15" />
    <circle cx="500" cy="85" r="3" fill="#78350f" />
    <circle cx="520" cy="85" r="3" fill="#78350f" />
    <path d="M504 96 Q510 102 516 96" stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round" />

    {/* Bakery Wooden Counter */}
    <rect x="0" y="320" width="600" height="130" fill="#fde68a" stroke="#d97706" strokeWidth="4" />
    <rect x="0" y="320" width="600" height="16" fill="#f59e0b" />

    {/* Barnaby Bear */}
    <g transform="translate(180, 110)">
      {/* Ears */}
      <circle cx="-10" cy="60" r="28" fill="url(#bearFur)" />
      <circle cx="-10" cy="60" r="15" fill="#fde68a" />
      <circle cx="130" cy="60" r="28" fill="url(#bearFur)" />
      <circle cx="130" cy="60" r="15" fill="#fde68a" />

      {/* Bear Body */}
      <ellipse cx="60" cy="220" rx="80" ry="90" fill="url(#bearFur)" />
      {/* Tummy */}
      <ellipse cx="60" cy="235" rx="55" ry="60" fill="#fef3c7" />

      {/* Bear Head */}
      <circle cx="60" cy="110" r="68" fill="url(#bearFur)" />

      {/* White Muzzle */}
      <ellipse cx="60" cy="130" rx="36" ry="26" fill="#fef3c7" />
      {/* Heart-Shaped Nose */}
      <path d="M54 118 Q60 114 66 118 Q60 128 54 118 Z" fill="#78350f" />
      {/* Big Happy Smile */}
      <path d="M46 132 Q60 148 74 132" stroke="#78350f" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* Sparkly Eyes */}
      <ellipse cx="38" cy="98" rx="8" ry="11" fill="#451a03" />
      <circle cx="36" cy="94" r="3.5" fill="#ffffff" />
      <ellipse cx="82" cy="98" rx="8" ry="11" fill="#451a03" />
      <circle cx="80" cy="94" r="3.5" fill="#ffffff" />

      {/* Rosy Cheeks */}
      <ellipse cx="22" cy="120" rx="10" ry="6" fill="#f472b6" opacity="0.6" />
      <ellipse cx="98" cy="120" rx="10" ry="6" fill="#f472b6" opacity="0.6" />

      {/* Chef Hat */}
      <path
        d="M20 55 C10 10 50 -10 60 5 C70 -10 110 10 100 55 Z"
        fill="#ffffff"
        filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
      />
      <rect x="25" y="52" width="70" height="16" rx="4" fill="#f1f5f9" />

      {/* Paws */}
      <ellipse cx="-5" cy="220" rx="20" ry="15" fill="url(#bearFur)" />
      <ellipse cx="125" cy="220" rx="20" ry="15" fill="url(#bearFur)" />

      {/* Wooden Spoon */}
      <g transform="translate(115, 170) rotate(-25)">
        <rect x="0" y="0" width="10" height="70" rx="4" fill="#d97706" />
        <ellipse cx="5" cy="0" rx="14" ry="20" fill="#b45309" />
      </g>
    </g>

    {/* Floating Magical Cupcakes */}
    <g transform="translate(420, 260)">
      {/* Cupcake 1 */}
      <polygon points="10,40 40,40 34,70 16,70" fill="#fdba74" />
      <path d="M5 40 Q25 15 45 40 Z" fill="url(#cupcakeIcing)" />
      <circle cx="25" cy="22" r="5" fill="#ef4444" />
      <circle cx="16" cy="30" r="1.5" fill="#ffffff" />
      <circle cx="34" cy="32" r="1.5" fill="#facc15" />
    </g>

    <g transform="translate(100, 270) scale(0.9)">
      {/* Cupcake 2 */}
      <polygon points="10,40 40,40 34,70 16,70" fill="#a7f3d0" />
      <path d="M5 40 Q25 15 45 40 Z" fill="#60a5fa" />
      <circle cx="25" cy="22" r="5" fill="#f59e0b" />
    </g>
  </svg>
);

// 3. Marina the Gentle Sea Turtle
const TurtleIllustration: React.FC = () => (
  <svg viewBox="0 0 600 450" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="oceanBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <linearGradient id="turtleShell" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#86efac" />
        <stop offset="50%" stopColor="#4ade80" />
        <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>
    </defs>

    {/* Turquoise Ocean Water */}
    <rect width="600" height="450" fill="url(#oceanBg)" />

    {/* Sun Rays */}
    <polygon points="150,0 220,0 280,450 180,450" fill="#ffffff" opacity="0.12" />
    <polygon points="320,0 390,0 470,450 370,450" fill="#ffffff" opacity="0.15" />

    {/* Bottom Sand & Coral Reef */}
    <path d="M0 380 Q150 360 300 390 Q450 410 600 370 L600 450 L0 450 Z" fill="#fef08a" />

    {/* Cute Pink Coral */}
    <g fill="#f472b6" opacity="0.9">
      <path d="M480 410 C470 340 500 330 510 370 C520 330 550 340 540 410 Z" />
      <path d="M60 420 C50 360 80 350 90 380 C100 350 120 360 115 420 Z" />
    </g>

    {/* Smiling Little Starfish */}
    <g transform="translate(130, 390) scale(0.8)">
      <polygon points="25,5 31,19 46,21 35,32 38,47 25,39 12,47 15,32 4,21 19,19" fill="#fb7185" />
      <circle cx="21" cy="24" r="2" fill="#881337" />
      <circle cx="29" cy="24" r="2" fill="#881337" />
      <path d="M22 30 Q25 33 28 30" stroke="#881337" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>

    {/* Translucent Bubbles */}
    <circle cx="160" cy="180" r="14" fill="#ffffff" opacity="0.3" stroke="#ffffff" strokeWidth="1.5" />
    <circle cx="155" cy="175" r="4" fill="#ffffff" opacity="0.7" />
    <circle cx="420" cy="140" r="18" fill="#ffffff" opacity="0.3" stroke="#ffffff" strokeWidth="1.5" />
    <circle cx="414" cy="134" r="5" fill="#ffffff" opacity="0.7" />
    <circle cx="450" cy="110" r="10" fill="#ffffff" opacity="0.25" stroke="#ffffff" strokeWidth="1" />

    {/* Marina the Baby Sea Turtle */}
    <g transform="translate(200, 120)">
      {/* Back Flippers */}
      <ellipse cx="60" cy="180" rx="20" ry="14" fill="#4ade80" />
      <ellipse cx="140" cy="180" rx="20" ry="14" fill="#4ade80" />

      {/* Front Big Flippers */}
      <path d="M20 120 C-30 110 -60 140 -30 170 C0 150 10 130 20 120 Z" fill="#4ade80" />
      <path d="M180 120 C230 110 260 140 230 170 C200 150 190 130 180 120 Z" fill="#4ade80" />

      {/* Shell */}
      <ellipse cx="100" cy="130" rx="75" ry="60" fill="url(#turtleShell)" stroke="#16a34a" strokeWidth="6" />

      {/* Shell Hexagon Pattern */}
      <polygon points="100,90 125,105 125,135 100,150 75,135 75,105" fill="#22c55e" opacity="0.8" />
      <polygon points="65,115 80,125 75,145 55,145 45,130 50,115" fill="#16a34a" opacity="0.5" />
      <polygon points="135,115 150,115 155,130 145,145 125,145 120,125" fill="#16a34a" opacity="0.5" />

      {/* Turtle Head */}
      <ellipse cx="100" cy="55" rx="36" ry="32" fill="#86efac" stroke="#16a34a" strokeWidth="3" />

      {/* Big Friendly Eyes */}
      <ellipse cx="85" cy="50" rx="9" ry="12" fill="#0f172a" />
      <circle cx="82" cy="45" r="4" fill="#ffffff" />
      <ellipse cx="115" cy="50" rx="9" ry="12" fill="#0f172a" />
      <circle cx="112" cy="45" r="4" fill="#ffffff" />

      {/* Pink Cheeks */}
      <ellipse cx="74" cy="65" rx="7" ry="4" fill="#f472b6" opacity="0.7" />
      <ellipse cx="126" cy="65" rx="7" ry="4" fill="#f472b6" opacity="0.7" />

      {/* Sweet Smile */}
      <path d="M92 68 Q100 76 108 68" stroke="#166534" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>

    {/* Little Orange Clownfish */}
    <g transform="translate(460, 240) scale(0.7)">
      <ellipse cx="30" cy="20" rx="25" ry="16" fill="#f97316" />
      <polygon points="50,20 70,5 70,35" fill="#ea580c" />
      <path d="M25 5 Q30 20 25 35" stroke="#ffffff" strokeWidth="5" fill="none" />
      <circle cx="15" cy="16" r="3" fill="#ffffff" />
      <circle cx="14" cy="16" r="1.5" fill="#000000" />
    </g>
  </svg>
);

// 4. Clockwork Pegasus & Cloud City
const PegasusIllustration: React.FC = () => (
  <svg viewBox="0 0 600 450" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pegasusSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="40%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="brassGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
    </defs>

    {/* Sunrise Sky */}
    <rect width="600" height="450" fill="url(#pegasusSky)" />

    {/* Fluffy Sunset Clouds */}
    <g fill="#ffffff" opacity="0.85">
      <circle cx="100" cy="380" r="80" />
      <circle cx="220" cy="390" r="90" />
      <circle cx="360" cy="400" r="100" />
      <circle cx="500" cy="380" r="85" />
    </g>

    {/* Clockwork Pegasus */}
    <g transform="translate(210, 110)">
      {/* Crystal Wings */}
      <path
        d="M60 90 C120 10 180 20 210 70 C160 80 120 90 60 110 Z"
        fill="#e0f2fe"
        stroke="#38bdf8"
        strokeWidth="3"
        filter="drop-shadow(0 0 8px rgba(56,189,248,0.5))"
      />
      <path
        d="M20 90 C-40 10 -100 20 -130 70 C-80 80 -40 90 20 110 Z"
        fill="#e0f2fe"
        stroke="#38bdf8"
        strokeWidth="3"
        filter="drop-shadow(0 0 8px rgba(56,189,248,0.5))"
      />

      {/* Pony Body */}
      <ellipse cx="40" cy="130" rx="55" ry="42" fill="url(#brassGrad)" />

      {/* Golden Legs */}
      <rect x="0" y="150" width="12" height="45" rx="6" fill="#ca8a04" />
      <rect x="25" y="155" width="12" height="40" rx="6" fill="#ca8a04" />
      <rect x="50" y="150" width="12" height="45" rx="6" fill="#ca8a04" />
      <rect x="75" y="155" width="12" height="40" rx="6" fill="#ca8a04" />

      {/* Neck & Head */}
      <path d="M-10 130 Q-25 70 0 45 Q20 50 15 110 Z" fill="url(#brassGrad)" />
      <ellipse cx="-15" cy="50" rx="28" ry="22" fill="url(#brassGrad)" />
      {/* Ears */}
      <polygon points="-8,30 -2,10 5,30" fill="#eab308" />

      {/* Friendly Big Eye */}
      <circle cx="-20" cy="46" r="7" fill="#0f172a" />
      <circle cx="-22" cy="43" r="2.5" fill="#ffffff" />
      <circle cx="-18" cy="49" r="1.2" fill="#ffffff" />

      {/* Little Smile */}
      <path d="M-36 58 Q-30 64 -24 58" stroke="#713f12" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Mane of Light */}
      <path d="M-5 25 Q15 20 5 45 Q25 45 10 70" stroke="#fef08a" strokeWidth="8" fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

// 5. Hero Welcome Banner (Child & Dragon reading together)
const HeroIllustration: React.FC = () => (
  <svg viewBox="0 0 600 450" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heroSky" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="50%" stopColor="#fce7f3" />
        <stop offset="100%" stopColor="#e0e7ff" />
      </linearGradient>
      <linearGradient id="glowBook" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>

    {/* Warm Magical Dream Sky */}
    <rect width="600" height="450" fill="url(#heroSky)" />

    {/* Big Fluffy Pink Bedtime Cloud */}
    <g fill="#ffffff" filter="drop-shadow(0 8px 16px rgba(244,114,182,0.25))">
      <ellipse cx="300" cy="330" rx="220" ry="85" />
      <circle cx="160" cy="300" r="75" />
      <circle cx="260" cy="270" r="85" />
      <circle cx="360" cy="280" r="80" />
      <circle cx="440" cy="310" r="70" />
    </g>

    {/* Stars & Crescent Moon */}
    <path
      d="M500 50 C550 50 570 100 570 140 C570 180 540 200 500 200 C550 180 550 80 500 50 Z"
      fill="#facc15"
    />
    <circle cx="530" cy="120" r="3" fill="#78350f" />
    <path d="M526 130 Q532 135 538 130" stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round" />

    <text x="80" y="90" fontSize="24">⭐</text>
    <text x="440" y="80" fontSize="20">✨</text>
    <text x="120" y="160" fontSize="18">🌟</text>

    {/* Little Girl / Child Reading */}
    <g transform="translate(170, 160)">
      {/* Body / PJs */}
      <ellipse cx="60" cy="130" rx="42" ry="48" fill="#38bdf8" />
      {/* Child Head */}
      <circle cx="60" cy="65" r="42" fill="#fed7aa" />

      {/* Hair (Brown Curls with Red Ribbon) */}
      <path d="M20 60 C15 15 105 15 100 60 C80 35 40 35 20 60 Z" fill="#78350f" />
      <circle cx="20" cy="50" r="14" fill="#78350f" />
      <circle cx="100" cy="50" r="14" fill="#78350f" />
      <path d="M18 55 Q60 30 102 55" stroke="#ef4444" strokeWidth="5" fill="none" />

      {/* Eyes Smiling Joyfully */}
      <path d="M42 65 Q50 58 58 65" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M68 65 Q76 58 84 65" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Rosy Cheeks & Happy Smile */}
      <ellipse cx="38" cy="74" rx="7" ry="4" fill="#f472b6" opacity="0.6" />
      <ellipse cx="88" cy="74" rx="7" ry="4" fill="#f472b6" opacity="0.6" />
      <path d="M54 74 Q63 85 72 74" stroke="#78350f" strokeWidth="3" fill="#f43f5e" strokeLinecap="round" />
    </g>

    {/* Friendly Baby Red Dragon Reading Beside Her */}
    <g transform="translate(320, 175)">
      {/* Dragon Body */}
      <ellipse cx="50" cy="120" rx="38" ry="42" fill="#ef4444" />
      {/* Dragon Head */}
      <circle cx="50" cy="65" r="35" fill="#ef4444" />
      {/* Horns */}
      <polygon points="35,35 40,15 48,35" fill="#fef08a" />
      <polygon points="52,35 60,15 65,35" fill="#fef08a" />

      {/* Big Sparkling Eyes */}
      <circle cx="38" cy="62" r="7" fill="#0f172a" />
      <circle cx="36" cy="59" r="2.5" fill="#ffffff" />
      <circle cx="62" cy="62" r="7" fill="#0f172a" />
      <circle cx="60" cy="59" r="2.5" fill="#ffffff" />

      {/* Smile */}
      <path d="M44 74 Q50 82 56 74" stroke="#881337" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Tiny Wings */}
      <path d="M80 90 C105 70 115 90 100 115 Z" fill="#fda4af" />
    </g>

    {/* Glowing Storybook in Center */}
    <g transform="translate(240, 270)">
      <polygon points="20,10 60,0 100,10 90,60 60,50 30,60" fill="url(#glowBook)" filter="drop-shadow(0 0 16px rgba(250,204,21,0.8))" />
      <line x1="60" y1="0" x2="60" y2="50" stroke="#b45309" strokeWidth="2" />
      {/* Sparkles rising from book */}
      <text x="35" y="-10" fontSize="16">✨</text>
      <text x="65" y="-20" fontSize="20">🌟</text>
    </g>
  </svg>
);

// 6. Child Explorer & Happy Puppy
const PuppyIllustration: React.FC = () => (
  <svg viewBox="0 0 600 450" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rainbowSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#bae6fd" />
        <stop offset="100%" stopColor="#e0f2fe" />
      </linearGradient>
    </defs>

    {/* Sunny Meadow Sky */}
    <rect width="600" height="450" fill="url(#rainbowSky)" />

    {/* Bright Rainbow */}
    <g opacity="0.85">
      <path d="M0 350 A300 300 0 0 1 600 350" stroke="#f87171" strokeWidth="12" fill="none" />
      <path d="M0 350 A288 288 0 0 1 600 350" stroke="#fb923c" strokeWidth="12" fill="none" />
      <path d="M0 350 A276 276 0 0 1 600 350" stroke="#fde047" strokeWidth="12" fill="none" />
      <path d="M0 350 A264 264 0 0 1 600 350" stroke="#4ade80" strokeWidth="12" fill="none" />
      <path d="M0 350 A252 252 0 0 1 600 350" stroke="#60a5fa" strokeWidth="12" fill="none" />
      <path d="M0 350 A240 240 0 0 1 600 350" stroke="#c084fc" strokeWidth="12" fill="none" />
    </g>

    {/* Green Sunny Hills */}
    <path d="M0 360 Q180 320 350 360 Q500 380 600 340 L600 450 L0 450 Z" fill="#86efac" />
    <path d="M0 380 Q250 350 600 370 L600 450 L0 450 Z" fill="#4ade80" />

    {/* Smiling Sun */}
    <circle cx="80" cy="80" r="35" fill="#facc15" />
    <circle cx="70" cy="75" r="3.5" fill="#78350f" />
    <circle cx="90" cy="75" r="3.5" fill="#78350f" />
    <path d="M74 86 Q80 92 86 86" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />

    {/* Happy Child Explorer */}
    <g transform="translate(190, 190)">
      {/* Body */}
      <ellipse cx="40" cy="115" rx="30" ry="38" fill="#f97316" />
      {/* Head */}
      <circle cx="40" cy="55" r="32" fill="#fed7aa" />
      {/* Red Adventure Cap */}
      <path d="M10 50 C10 20 70 20 70 50 Z" fill="#ef4444" />
      <polygon points="65,48 95,45 75,55" fill="#ef4444" />

      {/* Smiling Face */}
      <circle cx="30" cy="50" r="4" fill="#0f172a" />
      <circle cx="50" cy="50" r="4" fill="#0f172a" />
      <path d="M34 62 Q40 70 46 62" stroke="#78350f" strokeWidth="2.5" fill="#ef4444" strokeLinecap="round" />
    </g>

    {/* Cute Happy Puppy */}
    <g transform="translate(320, 240)">
      {/* Puppy Body */}
      <ellipse cx="50" cy="75" rx="38" ry="30" fill="#fde047" />
      {/* Tail Wagging */}
      <path d="M85 70 Q105 50 110 65" stroke="#ca8a04" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* Paws */}
      <rect x="25" y="95" width="12" height="22" rx="6" fill="#ca8a04" />
      <rect x="65" y="95" width="12" height="22" rx="6" fill="#ca8a04" />

      {/* Puppy Head */}
      <circle cx="30" cy="40" r="28" fill="#fde047" />
      {/* Floppy Ears */}
      <ellipse cx="8" cy="40" rx="10" ry="20" fill="#ca8a04" />
      <ellipse cx="52" cy="40" rx="10" ry="20" fill="#ca8a04" />

      {/* Button Nose & Tongue */}
      <ellipse cx="25" cy="46" rx="5" ry="4" fill="#1e293b" />
      <path d="M22 52 Q25 60 28 52" fill="#f43f5e" />

      {/* Happy Eyes */}
      <circle cx="18" cy="35" r="4" fill="#0f172a" />
      <circle cx="17" cy="33" r="1.5" fill="#ffffff" />
      <circle cx="34" cy="35" r="4" fill="#0f172a" />
      <circle cx="33" cy="33" r="1.5" fill="#ffffff" />
    </g>
  </svg>
);

// 7. Oliver the Clever Bunny in Flower Meadow
const BunnyIllustration: React.FC = () => (
  <svg viewBox="0 0 600 450" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bunnySky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fbcfe8" />
        <stop offset="40%" stopColor="#ede9fe" />
        <stop offset="100%" stopColor="#e0e7ff" />
      </linearGradient>
      <linearGradient id="bunnyFur" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#fdf4ff" />
      </linearGradient>
    </defs>

    {/* Pastel Twilight Sky */}
    <rect width="600" height="450" fill="url(#bunnySky)" />

    {/* Smiling Little Moon */}
    <path
      d="M490 60 C530 60 550 100 550 130 C550 170 520 185 490 185 C530 165 530 85 490 60 Z"
      fill="#facc15"
    />
    <circle cx="512" cy="115" r="2.5" fill="#78350f" />
    <path d="M508 124 Q513 128 518 124" stroke="#78350f" strokeWidth="1.5" fill="none" strokeLinecap="round" />

    {/* Sparkle Stars */}
    <circle cx="90" cy="80" r="3" fill="#ffffff" />
    <circle cx="180" cy="60" r="4" fill="#fef08a" />
    <circle cx="380" cy="70" r="3.5" fill="#ffffff" />
    <circle cx="430" cy="110" r="3" fill="#fef08a" />

    {/* Rolling Flower Hills */}
    <path d="M0 340 Q160 290 340 330 Q480 350 600 310 L600 450 L0 450 Z" fill="#bbf7d0" />
    <path d="M0 370 Q220 330 440 360 Q520 370 600 350 L600 450 L0 450 Z" fill="#86efac" />

    {/* Wildflowers */}
    <circle cx="70" cy="360" r="6" fill="#f43f5e" />
    <circle cx="70" cy="360" r="2.5" fill="#fef08a" />
    <circle cx="120" cy="380" r="7" fill="#fbbf24" />
    <circle cx="120" cy="380" r="3" fill="#ffffff" />
    <circle cx="480" cy="370" r="6.5" fill="#c084fc" />
    <circle cx="480" cy="370" r="2.5" fill="#fef08a" />
    <circle cx="530" cy="390" r="7" fill="#38bdf8" />
    <circle cx="530" cy="390" r="3" fill="#ffffff" />

    {/* Oliver the Bunny */}
    <g transform="translate(230, 120)">
      {/* Tall Ears */}
      <g transform="translate(30, 0)">
        {/* Left Ear */}
        <ellipse cx="15" cy="50" rx="16" ry="60" fill="url(#bunnyFur)" stroke="#f3e8ff" strokeWidth="2" />
        <ellipse cx="15" cy="55" rx="9" ry="42" fill="#fbcfe8" />
        {/* Right Ear (curved slightly) */}
        <ellipse cx="65" cy="50" rx="16" ry="60" fill="url(#bunnyFur)" stroke="#f3e8ff" strokeWidth="2" transform="rotate(8 65 50)" />
        <ellipse cx="65" cy="55" rx="9" ry="42" fill="#fbcfe8" transform="rotate(8 65 55)" />
      </g>

      {/* Bunny Body */}
      <ellipse cx="70" cy="205" rx="65" ry="70" fill="url(#bunnyFur)" stroke="#f3e8ff" strokeWidth="2" />
      {/* Fluffy Tummy */}
      <ellipse cx="70" cy="215" rx="42" ry="46" fill="#fdf2f8" />

      {/* Tiny Fluffy Tail */}
      <circle cx="0" cy="225" r="18" fill="#ffffff" />

      {/* Bunny Head */}
      <circle cx="70" cy="115" r="54" fill="url(#bunnyFur)" stroke="#f3e8ff" strokeWidth="2" />

      {/* Big Twinkling Eyes */}
      <ellipse cx="50" cy="105" rx="8" ry="11" fill="#1e1b4b" />
      <circle cx="48" cy="101" r="3.5" fill="#ffffff" />
      <circle cx="52" cy="109" r="1.5" fill="#ffffff" />

      <ellipse cx="90" cy="105" rx="8" ry="11" fill="#1e1b4b" />
      <circle cx="88" cy="101" r="3.5" fill="#ffffff" />
      <circle cx="92" cy="109" r="1.5" fill="#ffffff" />

      {/* Rosy Cheeks */}
      <ellipse cx="36" cy="122" rx="9" ry="5" fill="#f472b6" opacity="0.6" />
      <ellipse cx="104" cy="122" rx="9" ry="5" fill="#f472b6" opacity="0.6" />

      {/* Pink Heart Nose & Mouth */}
      <polygon points="66,118 74,118 70,123" fill="#f43f5e" />
      <path d="M64 126 Q70 131 76 126" stroke="#831843" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Little Adventure Satchel (Teal Strap) */}
      <path d="M30 170 Q70 210 110 220" stroke="#0d9488" strokeWidth="6" fill="none" strokeLinecap="round" />
      <rect x="95" y="200" width="28" height="24" rx="6" fill="#14b8a6" stroke="#0f766e" strokeWidth="2" />
      <circle cx="109" cy="212" r="3" fill="#fef08a" />

      {/* Paws holding a glowing yellow star */}
      <ellipse cx="50" cy="190" rx="14" ry="10" fill="#ffffff" />
      <ellipse cx="90" cy="190" rx="14" ry="10" fill="#ffffff" />

      {/* Glowing Star in Paws */}
      <g transform="translate(60, 172) scale(0.45)">
        <polygon
          points="25,0 32,15 49,18 37,30 40,47 25,39 9,47 13,30 1,18 17,15"
          fill="#facc15"
          filter="drop-shadow(0 0 8px rgba(250,204,21,0.9))"
        />
      </g>
    </g>
  </svg>
);

// 8. Baby Dinosaur in Secret Valley
const DinoIllustration: React.FC = () => (
  <svg viewBox="0 0 600 450" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dinoSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fed7aa" />
        <stop offset="60%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#bae6fd" />
      </linearGradient>
      <linearGradient id="dinoSkin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4ade80" />
        <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>
    </defs>

    {/* Warm Sunny Jungle Sky */}
    <rect width="600" height="450" fill="url(#dinoSky)" />

    {/* Smiling Sunshine */}
    <circle cx="500" cy="70" r="32" fill="#facc15" />
    <circle cx="490" cy="65" r="3" fill="#78350f" />
    <circle cx="510" cy="65" r="3" fill="#78350f" />
    <path d="M495 76 Q500 81 505 76" stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round" />

    {/* Friendly Distant Mountains */}
    <polygon points="60,330 170,180 280,330" fill="#86efac" opacity="0.6" />
    <polygon points="210,330 320,160 430,330" fill="#6ee7b7" opacity="0.6" />

    {/* Tropical Palm Leaves */}
    <g fill="#15803d">
      <path d="M0 100 Q60 120 70 170 Q40 140 0 160 Z" />
      <path d="M0 60 Q80 70 110 110 Q70 100 0 110 Z" />
      <path d="M0 140 Q50 170 60 210 Q30 190 0 200 Z" />
    </g>

    {/* Gentle Meadow Ground */}
    <path d="M0 330 Q180 300 360 340 Q500 360 600 320 L600 450 L0 450 Z" fill="#86efac" />
    <path d="M0 360 Q220 330 600 350 L600 450 L0 450 Z" fill="#4ade80" />

    {/* Baby Dino Character */}
    <g transform="translate(200, 130)">
      {/* Soft Rounded Spikes along back */}
      <polygon points="12,140 2,125 18,125" fill="#facc15" />
      <polygon points="24,115 14,100 30,100" fill="#facc15" />
      <polygon points="38,90 28,75 44,75" fill="#facc15" />
      <polygon points="54,68 46,52 62,54" fill="#facc15" />

      {/* Curled Tail */}
      <path d="M30 190 Q-20 200 10 230 Q25 210 40 195 Z" fill="url(#dinoSkin)" />

      {/* Body */}
      <ellipse cx="80" cy="175" rx="60" ry="50" fill="url(#dinoSkin)" />
      {/* Tummy */}
      <ellipse cx="85" cy="185" rx="38" ry="32" fill="#bbf7d0" />

      {/* Feet */}
      <ellipse cx="55" cy="220" rx="16" ry="12" fill="#16a34a" />
      <ellipse cx="105" cy="220" rx="16" ry="12" fill="#16a34a" />

      {/* Dino Head */}
      <path
        d="M60 120 C50 60 110 40 150 70 C165 85 160 120 125 125 C100 125 80 140 60 120 Z"
        fill="url(#dinoSkin)"
      />

      {/* Big Friendly Dino Eye */}
      <circle cx="115" cy="75" r="9" fill="#0f172a" />
      <circle cx="112" cy="71" r="3.5" fill="#ffffff" />
      <circle cx="117" cy="78" r="1.5" fill="#ffffff" />

      {/* Cheerful Smile */}
      <path d="M130 95 Q145 105 152 90" stroke="#14532d" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Little Pink Cheek */}
      <ellipse cx="105" cy="92" rx="7" ry="4" fill="#f472b6" opacity="0.6" />

      {/* Fluttering Blue Butterfly on Snout */}
      <g transform="translate(158, 60) scale(0.7)">
        <ellipse cx="6" cy="6" rx="6" ry="4" fill="#38bdf8" />
        <ellipse cx="16" cy="6" rx="6" ry="4" fill="#38bdf8" />
        <circle cx="11" cy="8" r="2" fill="#0284c7" />
      </g>
    </g>
  </svg>
);

