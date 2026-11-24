import React from 'react';
import { OFFICIAL_PALETTE } from '../types';

export function AndeanBorder({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1080 24"
        preserveAspectRatio="none"
        className="w-full h-3 sm:h-4 block"
      >
        <defs>
          <pattern id="andinoBannerPattern" width="90" height="24" patternUnits="userSpaceOnUse">
            <rect width="90" height="24" fill="#10245A" />
            <rect y="0" width="90" height="3.5" fill="#E6007E" />
            <rect y="20.5" width="90" height="3.5" fill="#00A83B" />
            <polygon points="15,5 24,12 15,19 6,12" fill="#FFD500" />
            <polygon points="15,8.5 19.5,12 15,15.5 10.5,12" fill="#F04424" />
            <polygon points="45,5 54,12 45,19 36,12" fill="#B7E600" />
            <polygon points="45,8.5 49.5,12 45,15.5 40.5,12" fill="#1746D2" />
            <polygon points="75,5 84,12 75,19 66,12" fill="#FF6A00" />
            <polygon points="75,8.5 79.5,12 75,15.5 70.5,12" fill="#FFF8E7" />
          </pattern>
        </defs>
        <rect width="1080" height="24" fill="url(#andinoBannerPattern)" />
      </svg>
    </div>
  );
}

export function BrandPaletteStrip({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-9 h-1.5 w-full overflow-hidden rounded-full ${className}`} aria-hidden="true">
      {OFFICIAL_PALETTE.map((c) => (
        <div key={c.hex} style={{ backgroundColor: c.hex }} />
      ))}
    </div>
  );
}
