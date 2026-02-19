import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7C3AED, #A855F7, #EC4899)',
          borderRadius: '40px',
          position: 'relative',
        }}
      >
        {/* Livre ouvert stylisé - plus grand pour Apple */}
        <svg
          width="110"
          height="100"
          viewBox="0 0 110 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Page gauche */}
          <path
            d="M55 22C55 22 42 12 22 14C17 14.5 10 17 10 17V78C10 78 20 74 35 75C45 75.8 55 82 55 82"
            fill="rgba(255,255,255,0.9)"
            stroke="white"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Page droite */}
          <path
            d="M55 22C55 22 68 12 88 14C93 14.5 100 17 100 17V78C100 78 90 74 75 75C65 75.8 55 82 55 82"
            fill="rgba(255,255,255,0.95)"
            stroke="white"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Ligne de reliure */}
          <line x1="55" y1="22" x2="55" y2="82" stroke="rgba(168,85,247,0.4)" strokeWidth="3" />
          {/* Lignes de texte sur page gauche */}
          <line x1="20" y1="35" x2="45" y2="35" stroke="rgba(168,85,247,0.25)" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="43" x2="40" y2="43" stroke="rgba(168,85,247,0.2)" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="51" x2="42" y2="51" stroke="rgba(168,85,247,0.2)" strokeWidth="2" strokeLinecap="round" />
          {/* Lignes de texte sur page droite */}
          <line x1="65" y1="35" x2="90" y2="35" stroke="rgba(168,85,247,0.25)" strokeWidth="2" strokeLinecap="round" />
          <line x1="65" y1="43" x2="85" y2="43" stroke="rgba(168,85,247,0.2)" strokeWidth="2" strokeLinecap="round" />
          <line x1="65" y1="51" x2="88" y2="51" stroke="rgba(168,85,247,0.2)" strokeWidth="2" strokeLinecap="round" />
          {/* Petit point boussole en haut */}
          <circle cx="55" cy="10" r="6" fill="white" />
          <circle cx="55" cy="10" r="3" fill="#A855F7" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
