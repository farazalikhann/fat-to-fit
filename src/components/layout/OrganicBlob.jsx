export function BlobOne({ className, color = '#C5F547' }) {
  return (
    <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path
        fill={color}
        d="M45.7,-58.8C58.4,-49.6,67.2,-34.5,71.4,-18.1C75.6,-1.7,75.2,16,68.1,30.6C61,45.2,47.2,56.7,31.6,63.6C16,70.5,-1.4,72.8,-18.5,69.4C-35.6,66,-52.4,57,-62.5,42.9C-72.6,28.9,-76,9.9,-72.9,-7.4C-69.8,-24.7,-60.2,-40.3,-47,-49.8C-33.8,-59.4,-16.9,-62.9,0.4,-63.4C17.7,-63.9,33.1,-68,45.7,-58.8Z"
        transform="translate(100 100)"
      />
    </svg>
  )
}

export function BlobTwo({ className, color = '#52796F' }) {
  return (
    <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path
        fill={color}
        d="M42.3,-63.3C53.8,-56.4,61,-42.5,66.4,-28C71.8,-13.6,75.4,1.5,72.1,15.1C68.8,28.7,58.6,40.9,46.2,49.9C33.8,58.9,19.2,64.7,3.3,60.9C-12.6,57.1,-25.2,43.7,-37.4,32.4C-49.6,21.1,-61.4,11.9,-64.6,-0.7C-67.8,-13.3,-62.4,-26.6,-52.8,-34.9C-43.2,-43.2,-29.4,-46.5,-16.2,-52.9C-3,-59.3,9.6,-68.8,23.4,-69.4C37.2,-70,52.2,-61.7,42.3,-63.3Z"
        transform="translate(100 100)"
      />
    </svg>
  )
}

export function LeafLine({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 56C8 32 22 12 54 8C56 30 46 48 24 54C18 55.6 12.6 55 8 56Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 56C16 42 28 30 44 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
