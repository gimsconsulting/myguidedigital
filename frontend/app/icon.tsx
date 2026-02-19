import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
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
          borderRadius: '7px',
          position: 'relative',
        }}
      >
        {/* Livre ouvert stylisé */}
        <svg
          width="22"
          height="20"
          viewBox="0 0 44 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Page gauche */}
          <path
            d="M22 8C22 8 16 4 8 5C6 5.2 4 6 4 6V32C4 32 8 30 14 30.5C18 30.8 22 33 22 33"
            fill="rgba(255,255,255,0.9)"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Page droite */}
          <path
            d="M22 8C22 8 28 4 36 5C38 5.2 40 6 40 6V32C40 32 36 30 30 30.5C26 30.8 22 33 22 33"
            fill="rgba(255,255,255,0.95)"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Ligne de reliure */}
          <line x1="22" y1="8" x2="22" y2="33" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5" />
          {/* Petite étoile/boussole en haut */}
          <circle cx="22" cy="4" r="2.5" fill="white" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
