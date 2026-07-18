export const lbsToKg = (lbs) => lbs * 0.45359237
export const kgToLbs = (kg) => kg / 0.45359237

export const inchesToCm = (inches) => inches * 2.54
export const cmToInches = (cm) => cm / 2.54

export function cmToFtIn(cm) {
  const totalInches = cmToInches(cm)
  const ft = Math.floor(totalInches / 12)
  const inch = Math.round(totalInches - ft * 12)
  if (inch === 12) return { ft: ft + 1, inch: 0 }
  return { ft, inch }
}

export function ftInToCm(ft, inch) {
  return inchesToCm(Number(ft || 0) * 12 + Number(inch || 0))
}

export const round = (n, d = 0) => {
  const f = 10 ** d
  return Math.round(n * f) / f
}
