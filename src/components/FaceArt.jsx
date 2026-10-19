// Stylised face, left half real, right half analysed (mesh + attention blobs).
export default function FaceArt() {
  return (
    <svg viewBox="0 0 360 400" className="faceart" role="img" aria-label="A face split in two: the left half is the original, the right half shows a mesh and attention hotspots around the eye and mouth">
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e9b996" /><stop offset="1" stopColor="#c98f6c" /></linearGradient>
        <linearGradient id="bgf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#16264a" /><stop offset="1" stopColor="#0a1328" /></linearGradient>
        <radialGradient id="h1"><stop offset="0" stopColor="#ff2d2d" stopOpacity=".95" /><stop offset=".35" stopColor="#ffb22d" stopOpacity=".8" /><stop offset=".7" stopColor="#2dd4a0" stopOpacity=".35" /><stop offset="1" stopColor="#2dd4a0" stopOpacity="0" /></radialGradient>
        <radialGradient id="h2"><stop offset="0" stopColor="#ffb22d" stopOpacity=".9" /><stop offset=".5" stopColor="#2dd4a0" stopOpacity=".45" /><stop offset="1" stopColor="#2dd4a0" stopOpacity="0" /></radialGradient>
        <pattern id="mesh" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M14 0H0V14" fill="none" stroke="#7fb2ff" strokeOpacity=".35" strokeWidth=".7" /></pattern>
        <clipPath id="rightHalf"><rect x="180" y="0" width="180" height="400" /></clipPath>
        <clipPath id="headClip"><ellipse cx="180" cy="196" rx="96" ry="124" /></clipPath>
      </defs>
      <rect width="360" height="400" rx="20" fill="url(#bgf)" />
      <path d="M40 400c10-70 60-96 140-96s130 26 140 96Z" fill="#26365e" />
      <rect x="150" y="285" width="60" height="50" fill="#c98f6c" />
      <ellipse cx="180" cy="196" rx="96" ry="124" fill="url(#skin)" />
      <path d="M82 180c-6-86 40-126 100-126s104 40 96 126c-12-50-40-72-96-72s-86 22-100 72Z" fill="#2b1d17" />
      <g fill="#fff"><ellipse cx="144" cy="186" rx="17" ry="9" /><ellipse cx="216" cy="186" rx="17" ry="9" /></g>
      <g fill="#3a2a22"><circle cx="146" cy="186" r="6.5" /><circle cx="214" cy="186" r="6.5" /></g>
      <g stroke="#2b1d17" strokeWidth="5" strokeLinecap="round" fill="none"><path d="M120 164q24-12 46-2" /><path d="M194 162q22-10 46 2" /></g>
      <path d="M180 190v44q-8 6-14 4" stroke="#a8704f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M150 262q30 20 60 0" stroke="#9a4a4a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <g clipPath="url(#rightHalf)">
        <g clipPath="url(#headClip)">
          <rect x="180" y="60" width="180" height="280" fill="url(#mesh)" />
          <ellipse cx="216" cy="186" rx="46" ry="34" fill="url(#h1)" className="pulse" />
          <ellipse cx="190" cy="262" rx="44" ry="26" fill="url(#h2)" className="pulse d2" />
          <ellipse cx="248" cy="250" rx="30" ry="40" fill="url(#h2)" opacity=".55" />
        </g>
        <ellipse cx="180" cy="196" rx="96" ry="124" fill="none" stroke="#7fb2ff" strokeWidth="1.5" strokeDasharray="4 5" />
      </g>
      <line x1="180" y1="30" x2="180" y2="370" stroke="#fff" strokeOpacity=".85" strokeWidth="1.5" />
      <circle cx="180" cy="200" r="9" fill="#0a1328" stroke="#fff" strokeWidth="1.5" />
      <path d="m176 200 3-3m-3 3 3 3m10-3-3-3m3 3-3 3" stroke="#fff" strokeWidth="1.4" fill="none" />
      <g fontFamily="IBM Plex Sans, sans-serif" fontSize="12" fontWeight="600">
        <rect x="18" y="18" width="52" height="24" rx="6" fill="#16a34a" /><text x="44" y="34" textAnchor="middle" fill="#fff">Real</text>
        <rect x="290" y="18" width="62" height="24" rx="6" fill="#dc2626" /><text x="321" y="34" textAnchor="middle" fill="#fff">Deepfake</text>
      </g>
      <rect className="scan" x="0" y="0" width="360" height="3" fill="#7fb2ff" opacity=".7" />
    </svg>
  )
}
