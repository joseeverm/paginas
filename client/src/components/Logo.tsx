interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

export default function Logo({ size = 28, showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Fondo */}
        <rect width="100" height="100" rx="20" className="fill-stone-900 dark:fill-stone-100" />
        {/* Cuerpo de la pluma (diamante) */}
        <path d="M50,12 L72,54 L50,66 L28,54 Z" className="fill-stone-50 dark:fill-stone-900" />
        {/* Punta metálica */}
        <path d="M42,60 L50,88 L58,60 Z" className="fill-stone-400 dark:fill-stone-500" />
        {/* Hendidura central */}
        <path
          d="M50,50 L50,88"
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-stone-900 dark:stroke-stone-100 fill-none"
        />
        {/* Reflejo */}
        <path
          d="M38,22 L42,38"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.35"
          className="stroke-stone-300 dark:stroke-stone-600 fill-none"
        />
      </svg>

      {showText && (
        <span className="font-serif font-medium tracking-wide text-stone-800 dark:text-stone-100">
          Páginas
        </span>
      )}
    </div>
  )
}
