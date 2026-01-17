"use client"

interface HouseProps {
  isPerfect: boolean
  className?: string
}

export function House({ isPerfect, className = "" }: HouseProps) {
  if (isPerfect) {
    return (
      <svg 
      width="100" 
      height="150" 
      viewBox="0 0 200 300" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main House Body (Light Blue) */}
      <rect x="0" y="80" width="200" height="220" fill="#D0E0FF" />
      
      {/* The Main Roof (Dark Blue Trapezoid/Polygon) */}
      <path d="M0 80 L35 0 L165 0 L200 80 Z" fill="#3366FF" />
      
      {/* The Right Gable (Light Blue Triangle) */}
      <path d="M125 80 L162.5 5 L200 80 Z" fill="#D0E0FF" />
      
      {/* Horizontal Separator Line */}
      <line x1="0" y1="175" x2="200" y2="175" stroke="#3366FF" strokeWidth="2" />
      
      {/* Top Row Windows (Left) */}
      <rect x="17" y="110" width="41" height="50" fill="#3366FF" />
      <rect x="72" y="110" width="41" height="50" fill="#3366FF" />
      
      {/* Top Row Arched Window (Right) */}
      <path d="M137 110 A23 23 0 0 1 183 110 L183 165 L137 165 Z" fill="#3366FF" />
      
      {/* Bottom Row Windows (Left) */}
      <rect x="17" y="190" width="41" height="50" fill="#3366FF" />
      <rect x="72" y="190" width="41" height="50" fill="#3366FF" />
      
      {/* Door (Right) */}
      <rect x="137" y="190" width="41" height="100" fill="#3366FF" />
      
      {/* Door Details (Window panes) */}
      <rect x="151" y="200" width="13" height="13" fill="#D0E0FF" />
      <rect x="151" y="216" width="13" height="13" fill="#D0E0FF" />
      <rect x="167" y="200" width="13" height="13" fill="#D0E0FF" />
      <rect x="167" y="216" width="13" height="13" fill="#D0E0FF" />
      
      {/* Door Knob */}
      <rect x="169" y="250" width="4" height="2" fill="#D0E0FF" />
      
      {/* Planter Box */}
      <rect x="12" y="280" width="111" height="20" fill="#443333" />
      
      {/* Bush/Plants */}
      <path d="M12 280 Q12 270 22 270 Q32 270 32 280 Q32 265 47 265 Q62 265 62 280 Q62 260 82 260 Q102 260 102 280 Q102 270 112 270 Q123 270 123 280 Z" fill="#446644" />
    </svg>
    )
  }

  // Deteriorated house
  return (
    <svg 
      width="100" 
      height="150" 
      viewBox="0 0 200 300" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main House Body (Faded/Dirty Light Blue) */}
      <rect x="0" y="80" width="200" height="220" fill="#A9B8D4" />
      
      {/* Cracks on the wall */}
      <path d="M20 100 L30 115 L25 130" stroke="#7A89A4" strokeWidth="1" />
      <path d="M180 220 L170 240 L175 255" stroke="#7A89A4" strokeWidth="1" />
      <path d="M100 280 L105 260 L95 250" stroke="#7A89A4" strokeWidth="1" />

      {/* The Main Roof (Faded/Patchy Dark Blue) */}
      <path d="M0 80 L35 0 L165 0 L200 80 Z" fill="#4A5A8F" />
      {/* Roof damage/patches */}
      <path d="M40 10 L60 30 L50 40 Z" fill="#3A4A7F" opacity="0.5" />
      <path d="M140 20 L155 45 L130 35 Z" fill="#3A4A7F" opacity="0.5" />
      
      {/* The Right Gable (Faded Light Blue) */}
      <path d="M125 80 L162.5 5 L200 80 Z" fill="#A9B8D4" />
      
      {/* Horizontal Separator Line (Broken/Faded) */}
      <line x1="0" y1="175" x2="80" y2="175" stroke="#4A5A8F" strokeWidth="2" />
      <line x1="110" y1="175" x2="200" y2="175" stroke="#4A5A8F" strokeWidth="2" />
      
      {/* Top Row Windows (Left - Cracked/Darker) */}
      <rect x="17" y="110" width="41" height="50" fill="#2A3A6F" />
      <path d="M17 110 L58 160" stroke="#4A5A8F" strokeWidth="1" /> {/* Crack in window */}
      
      <rect x="72" y="110" width="41" height="50" fill="#2A3A6F" />
      
      {/* Top Row Arched Window (Right - Broken glass look) */}
      <path d="M137 110 A23 23 0 0 1 183 110 L183 165 L137 165 Z" fill="#1A2A5F" />
      <path d="M145 120 L160 140 L150 155" stroke="#4A5A8F" strokeWidth="1" />

      {/* Bottom Row Windows (Left) */}
      <rect x="17" y="190" width="41" height="50" fill="#2A3A6F" />
      <rect x="72" y="190" width="41" height="50" fill="#2A3A6F" />
      
      {/* Door (Right - Slightly askew/faded) */}
      <g transform="rotate(1, 157, 240)">
        <rect x="137" y="190" width="41" height="100" fill="#3A4A7F" />
        
        {/* Door Details (Broken/Missing panes) */}
        <rect x="151" y="200" width="13" height="13" fill="#8998B4" />
        <rect x="151" y="216" width="13" height="13" fill="#1A2A5F" /> {/* Missing pane */}
        <rect x="167" y="200" width="13" height="13" fill="#8998B4" />
        <rect x="167" y="216" width="13" height="13" fill="#8998B4" />
        
        {/* Door Knob (Missing/Darkened) */}
        <rect x="169" y="250" width="4" height="2" fill="#2A3A4F" />
      </g>
      
      {/* Planter Box (Weathered/Broken) */}
      <path d="M12 280 L123 280 L120 300 L15 300 Z" fill="#332222" />
      
      {/* Dead Bush/Plants (Brown and withered) */}
      <path d="M12 280 Q12 275 22 275 Q32 275 32 280 Q32 270 47 270 Q62 270 62 280 Q62 265 82 265 Q102 265 102 280 Q102 275 112 275 Q123 275 123 280 Z" fill="#5C4033" />
      {/* Sparse dead branches */}
      <path d="M30 270 L25 260" stroke="#3E2723" strokeWidth="1" />
      <path d="M60 265 L65 250" stroke="#3E2723" strokeWidth="1" />
      <path d="M90 260 L85 245" stroke="#3E2723" strokeWidth="1" />
    </svg>
  )
}
