import React from 'react';

export const Logo = ({ size = 36 }) => {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoTop" x1="24" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="logoLeft" x1="6" y1="14" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" />
            <stop offset="1" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="logoRight" x1="42" y1="14" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0066FF" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="logoCenter" x1="18" y1="18" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#93C5FD" />
          </linearGradient>
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer 3D Hexagon Facets */}
        <polygon points="24,4 42,14 24,24 6,14" fill="url(#logoTop)" />
        <polygon points="6,14 24,24 24,44 6,34" fill="url(#logoLeft)" />
        <polygon points="42,14 42,34 24,44 24,24" fill="url(#logoRight)" />

        {/* Inner Facet / Diamond Cutout */}
        <polygon points="24,12 33,18 24,24 15,18" fill="#E0F2FE" opacity="0.9" />
        <polygon points="15,18 24,24 24,34 15,28" fill="#3B82F6" opacity="0.9" />
        <polygon points="33,18 33,28 24,34 24,24" fill="#1D4ED8" opacity="0.9" />

        {/* Center Glow Node */}
        <circle cx="24" cy="24" r="3.5" fill="url(#logoCenter)" filter="url(#logoGlow)" />
      </svg>
    </div>
  );
};
