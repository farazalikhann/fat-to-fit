import './Inputs.css'

export function Field({ label, children, hint }) {
  return (
    <div className="field" role="group" aria-label={label}>
      <span className="field__label">{label}</span>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </div>
  )
}

export function NumberInput({ value, onChange, suffix, min, max, step = 1, ...rest }) {
  return (
    <div className="number-input">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        {...rest}
      />
      {suffix ? <span className="number-input__suffix">{suffix}</span> : null}
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
