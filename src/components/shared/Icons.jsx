const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const IconFlame = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <path d="M12 3c1 3-2.5 4-2.5 7A2.5 2.5 0 0 0 12 12.5 2.5 2.5 0 0 0 14.5 10c0-1 .5-1.5 1-2 1 1.5 1.5 3 1.5 4.5 0 3-2.2 6-5 6s-5.5-2.3-5.5-5.5C6.5 9 8 6 12 3Z" />
  </svg>
)

export const IconMacro = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 4a8 8 0 0 1 6.9 4" />
    <path d="M12 12 6 9" />
  </svg>
)

export const IconScale = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <rect x="4" y="4" width="16" height="16" rx="5" />
    <path d="M8 15c1-3 2-5 4-5s3 2 4 5" />
  </svg>
)

export const IconRuler = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <path d="m5 19 14-14" />
    <path d="m9 15 2-2M7 17l2-2m6-6 2-2m-1 4 2-2" />
  </svg>
)

export const IconDroplet = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <path d="M12 3c3.5 4.5 6 8 6 11.2A6 6 0 0 1 6 14.2C6 11 8.5 7.5 12 3Z" />
  </svg>
)

export const IconBody = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <circle cx="12" cy="5" r="2.2" />
    <path d="M8 21l1.5-7L8 11V8a4 4 0 0 1 8 0v3l-1.5 3L16 21" />
  </svg>
)

export const IconSun = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.3M12 19.2v2.3M4.5 12H2.2M21.8 12h-2.3M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
  </svg>
)

export const IconMoon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
  </svg>
)

export const IconDownload = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <path d="M12 3v12M12 15l-4.5-4.5M12 15l4.5-4.5" />
    <path d="M4.5 17v2A2.5 2.5 0 0 0 7 21.5h10a2.5 2.5 0 0 0 2.5-2.5v-2" />
  </svg>
)
