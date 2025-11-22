export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Document/Resume shape */}
      <path
        d="M8 4C8 2.89543 8.89543 2 10 2H18L24 8V28C24 29.1046 23.1046 30 22 30H10C8.89543 30 8 29.1046 8 28V4Z"
        fill="url(#gradient1)"
        stroke="white"
        strokeWidth="1.5"
      />
      
      {/* Document fold */}
      <path
        d="M18 2V8H24"
        fill="url(#gradient2)"
        stroke="white"
        strokeWidth="1.5"
      />
      
      {/* Job/Workforce lines on document */}
      <line x1="12" y1="12" x2="20" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="16" x2="18" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="20" x2="16" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* People/Workforce icons */}
      <circle cx="6" cy="26" r="2" fill="white" />
      <path d="M4 30C4 28.8954 4.89543 28 6 28C7.10457 28 8 28.8954 8 30" fill="white" />
      
      <circle cx="26" cy="26" r="2" fill="white" />
      <path d="M24 30C24 28.8954 24.8954 28 26 28C27.1046 28 28 28.8954 28 30" fill="white" />
      
      <circle cx="16" cy="26" r="2" fill="white" />
      <path d="M14 30C14 28.8954 14.8954 28 16 28C17.1046 28 18 28.8954 18 30" fill="white" />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  )
}
