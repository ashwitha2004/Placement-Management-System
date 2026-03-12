import React, { useState, useEffect } from 'react';

export default function ThreeDCharacter() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const rotX = (e.clientY - centerY) * 0.05;
      const rotY = (e.clientX - centerX) * 0.05;
      setRotation({ x: rotX, y: rotY });
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateZ(-2deg); }
          50% { transform: translateY(-20px) rotateZ(2deg); }
        }
        @keyframes thumbsUp {
          0%, 100% { transform: rotateZ(0deg); }
          25% { transform: rotateZ(5deg); }
          75% { transform: rotateZ(-5deg); }
        }
        .character {
          animation: float 3s ease-in-out infinite;
        }
        .thumbs {
          animation: thumbsUp 0.6s ease-in-out infinite;
        }
      `}</style>

      {/* Male Character (Left) */}
      <div
        className="absolute character"
        style={{
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translate(-80px, 0)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <svg width="160" height="220" viewBox="0 0 160 220" className="drop-shadow-2xl">
          {/* Head */}
          <circle cx="80" cy="40" r="30" fill="#D4A574" />
          
          {/* Hair */}
          <path d="M 50 30 Q 50 10 80 10 Q 110 10 110 30" fill="#4A3728" />
          <ellipse cx="80" cy="18" rx="25" ry="15" fill="#5C4A35" />
          
          {/* Eyes */}
          <circle cx="70" cy="35" r="3" fill="#333" />
          <circle cx="90" cy="35" r="3" fill="#333" />
          
          {/* Smile */}
          <path d="M 70 45 Q 80 50 90 45" stroke="#333" strokeWidth="2" fill="none" />
          
          {/* Shirt */}
          <rect x="50" y="75" width="60" height="50" rx="5" fill="#E8E8E8" />
          
          {/* Tie */}
          <rect x="77" y="75" width="6" height="35" fill="#4A90E2" />
          <path d="M 74 110 L 80 115 L 86 110 L 85 105 L 75 105 Z" fill="#4A90E2" />
          
          {/* Arms */}
          <rect x="35" y="85" width="15" height="50" rx="7" fill="#D4A574" transform="rotate(-35 42 85)" />
          <rect x="110" y="85" width="15" height="50" rx="7" fill="#D4A574" transform="rotate(35 118 85)" />
          
          {/* Thumbs Up (Left Hand) */}
          <g className="thumbs" style={{ transformOrigin: '42px 100px' }}>
            <circle cx="35" cy="130" r="8" fill="#D4A574" />
            <rect x="33" y="115" width="4" height="15" fill="#D4A574" />
            <text x="25" y="155" fontSize="24">👍</text>
          </g>
          
          {/* Thumbs Up (Right Hand) */}
          <g className="thumbs" style={{ transformOrigin: '118px 100px', animationDelay: '0.2s' }}>
            <circle cx="120" cy="130" r="8" fill="#D4A574" />
            <rect x="123" y="115" width="4" height="15" fill="#D4A574" />
            <text x="115" y="155" fontSize="24">👍</text>
          </g>
          
          {/* Pants */}
          <rect x="55" y="125" width="18" height="60" fill="#2C3E50" />
          <rect x="87" y="125" width="18" height="60" fill="#2C3E50" />
          
          {/* Shoes */}
          <ellipse cx="64" cy="190" rx="10" ry="8" fill="#1A1A1A" />
          <ellipse cx="96" cy="190" rx="10" ry="8" fill="#1A1A1A" />
        </svg>
      </div>

      {/* Female Character (Right) */}
      <div
        className="absolute character"
        style={{
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y * -1}deg) translate(80px, 0)`,
          transition: 'transform 0.1s ease-out',
          animationDelay: '0.3s',
        }}
      >
        <svg width="160" height="220" viewBox="0 0 160 220" className="drop-shadow-2xl">
          {/* Head */}
          <circle cx="80" cy="40" r="30" fill="#E8B4A0" />
          
          {/* Hair */}
          <path d="M 50 30 Q 50 5 80 5 Q 110 5 110 30" fill="#3D2817" />
          <ellipse cx="80" cy="18" rx="28" ry="18" fill="#4A3728" />
          <path d="M 50 40 Q 55 60 60 70" stroke="#3D2817" strokeWidth="3" fill="none" />
          <path d="M 110 40 Q 105 60 100 70" stroke="#3D2817" strokeWidth="3" fill="none" />
          
          {/* Eyes */}
          <circle cx="70" cy="35" r="3" fill="#333" />
          <circle cx="90" cy="35" r="3" fill="#333" />
          
          {/* Smile */}
          <path d="M 70 45 Q 80 50 90 45" stroke="#333" strokeWidth="2" fill="none" />
          
          {/* Shirt/Blouse */}
          <rect x="50" y="75" width="60" height="50" rx="5" fill="#E8E8E8" />
          
          {/* Tie/Collar */}
          <rect x="77" y="75" width="6" height="35" fill="#5B9FD9" />
          
          {/* Skirt */}
          <path d="M 50 125 L 45 180 Q 45 195 55 195 L 105 195 Q 115 195 115 180 L 110 125 Z" fill="#5B9FD9" />
          <line x1="80" y1="125" x2="80" y2="195" stroke="#4A7BA7" strokeWidth="1" opacity="0.5" />
          
          {/* Arms */}
          <rect x="35" y="85" width="15" height="50" rx="7" fill="#E8B4A0" transform="rotate(-35 42 85)" />
          <rect x="110" y="85" width="15" height="50" rx="7" fill="#E8B4A0" transform="rotate(35 118 85)" />
          
          {/* Thumbs Up (Left Hand) */}
          <g className="thumbs" style={{ transformOrigin: '42px 100px' }}>
            <circle cx="35" cy="130" r="8" fill="#E8B4A0" />
            <rect x="33" y="115" width="4" height="15" fill="#E8B4A0" />
            <text x="25" y="155" fontSize="24">👍</text>
          </g>
          
          {/* Thumbs Up (Right Hand) */}
          <g className="thumbs" style={{ transformOrigin: '118px 100px', animationDelay: '0.2s' }}>
            <circle cx="120" cy="130" r="8" fill="#E8B4A0" />
            <rect x="123" y="115" width="4" height="15" fill="#E8B4A0" />
            <text x="115" y="155" fontSize="24">👍</text>
          </g>
          
          {/* Shoes */}
          <ellipse cx="60" cy="200" rx="10" ry="8" fill="#C41E3A" />
          <ellipse cx="100" cy="200" rx="10" ry="8" fill="#C41E3A" />
        </svg>
      </div>
    </div>
  );
}
