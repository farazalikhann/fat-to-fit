import { useEffect, useState } from 'react'
import './Inputs.css'

export function Field({ label, children, hint, full = false }) {
  return (
    <div className={`field ${full ? 'field--full' : ''}`} role="group" aria-label={label}>
      <span className="field__label">{label}</span>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </div>
  )
}

const displayText = (value) => (value === '' || value === null || value === undefined ? '' : String(value))

export function NumberInput({ value, onChange, suffix, min, max, step = 1, onFocus, onBlur, ...rest }) {
  const [text, setText] = useState(displayText(value))
  const [focused, setFocused] = useState(false)

  // Follow external value changes (e.g. a unit toggle recalculating this
  // same field) while the user isn't actively typing in it, without
  // clobbering their in-progress keystrokes.
  useEffect(() => {
    if (!focused) setText(displayText(value))
  }, [value, focused])

  const handleFocus = (e) => {
    setFocused(true)
    // A field showing "0" is almost always an unset/default value - clear
    // it so the user can type straight in instead of deleting the 0 first.
    if (Number(value) === 0) setText('')
    onFocus?.(e)
  }

  const handleBlur = (e) => {
    setFocused(false)
    if (text === '') {
      setText('0')
      onChange(0)
    }
    onBlur?.(e)
  }

  const handleChange = (e) => {
    let raw = e.target.value
    // Strip leading zeros as the user types ("06" -> "6"), but leave valid
    // decimals like "0.5" alone.
    if (/^0[0-9]/.test(raw)) raw = raw.replace(/^0+/, '')
    setText(raw)
    onChange(raw === '' ? '' : Number(raw))
  }

  return (
    <div className="number-input">
      <input
        type="number"
        value={text}
        min={min}
        max={max}
        step={step}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        {...rest}
      />
      {suffix ? <span className="number-input__suffix">{suffix}</span> : null}
    </div>
  )
}

export function TextAreaInput({ value, onChange, placeholder, rows = 3, ...rest }) {
  return (
    <div className="textarea-input">
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  )
}

export function SegmentedToggle({ options, value, onChange }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={`segmented__btn ${value === opt.value ? 'is-active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function PillGroup({ options, value, onChange, columns = 1 }) {
  return (
    <div className="pill-group" style={{ '--cols': columns }}>
      {options.map((opt) => (
        <button
          key={opt.value ?? opt.id}
          type="button"
          className={`pill ${value === (opt.value ?? opt.id) ? 'is-active' : ''}`}
          onClick={() => onChange(opt.value ?? opt.id)}
        >
          <span className="pill__label">{opt.label}</span>
          {opt.detail ? <span className="pill__detail">{opt.detail}</span> : null}
        </button>
      ))}
    </div>
  )
}
