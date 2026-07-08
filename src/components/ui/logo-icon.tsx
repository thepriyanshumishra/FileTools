export function LogoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Page */}
      <path
        d="M5 6H13L17 10V20C17 20.5523 16.5523 21 16 21H5C4.44772 21 4 20.5523 4 20V7C4 6.44772 4.44772 6 5 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      {/* Foreground Page */}
      <path
        d="M9 3H17L21 7V17C21 17.5523 20.5523 18 20 18H9C8.44772 18 8 17.5523 8 17V4C8 3.44772 8.44772 3 9 3Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Connecting Flow Arrow */}
      <path
        d="M12 11H17M17 11L15 9M17 11L15 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
