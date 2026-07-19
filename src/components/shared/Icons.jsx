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

export const IconSparkle = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <path d="M12 3c.6 3.4 1.6 4.4 5 5-3.4.6-4.4 1.6-5 5-.6-3.4-1.6-4.4-5-5 3.4-.6 4.4-1.6 5-5Z" />
    <path d="M19 14c.3 1.6.8 2.1 2.4 2.4-1.6.3-2.1.8-2.4 2.4-.3-1.6-.8-2.1-2.4-2.4 1.6-.3 2.1-.8 2.4-2.4Z" />
  </svg>
)

export const IconGoogle = (p) => (
  <svg viewBox="0 0 18 18" width="16" height="16" {...p}>
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z"
    />
    <path
      fill="#FBBC05"
      d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33Z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
    />
  </svg>
)

export const IconTrash = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...common} {...p}>
    <path d="M5 7h14M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0 1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
  </svg>
)

export const IconNotebook = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2.5" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
)

export const IconCamera = (p) => (
  <svg viewBox="0 0 24 24" width="17" height="17" {...common} {...p}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5Z" />
    <circle cx="12" cy="12.5" r="3.3" />
  </svg>
)

export const IconClose = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" {...common} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const IconSettings = (p) => (
  <svg viewBox="0 0 24 24" width="17" height="17" {...common} {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2.06 2.06 0 1 1-2.92 2.92l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56v.17a2.06 2.06 0 1 1-4.12 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2.06 2.06 0 1 1-2.92-2.92l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03h-.17a2.06 2.06 0 1 1 0-4.12h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2.06 2.06 0 1 1 2.92-2.92l.06.06a1.7 1.7 0 0 0 1.87.34h.08a1.7 1.7 0 0 0 1.03-1.56V4.6a2.06 2.06 0 1 1 4.12 0v.09a1.7 1.7 0 0 0 1.03 1.56h.08a1.7 1.7 0 0 0 1.87-.34l.06-.06a2.06 2.06 0 1 1 2.92 2.92l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.56 1.03h.17a2.06 2.06 0 1 1 0 4.12h-.09a1.7 1.7 0 0 0-1.56 1.03Z" />
  </svg>
)

export const IconLogout = (p) => (
  <svg viewBox="0 0 24 24" width="17" height="17" {...common} {...p}>
    <path d="M15 17.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1.5" />
    <path d="M21 12H10m11 0-3.5-3.5M21 12l-3.5 3.5" />
  </svg>
)

export const IconHome = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...common} {...p}>
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10v9a1 1 0 0 0 1 1h3v-5.5h4V20h3a1 1 0 0 0 1-1v-9" />
  </svg>
)

export const IconChevronLeft = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <path d="M15 5 8 12l7 7" />
  </svg>
)

export const IconChevronRight = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <path d="M9 5l7 7-7 7" />
  </svg>
)

export const IconCalendar = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...p}>
    <rect x="4" y="5" width="16" height="16" rx="2.5" />
    <path d="M8 3v4M16 3v4M4 10h16" />
  </svg>
)
