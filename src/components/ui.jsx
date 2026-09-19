import { useEffect } from 'react'
import Icon from './icons.jsx'

export const Card = ({ className = '', pad = true, children, ...p }) => (
  <div className={`card ${pad ? 'pad' : ''} ${className}`} {...p}>{children}</div>
)

export const Panel = ({ title, serif, action, children, className = '' }) => (
  <section className={`panel ${className}`}>
    {(title || action) && (
      <div className="panel-head">
        <h3 className={`panel-title ${serif ? 'serif' : ''}`}>{title}</h3>
        {action}
      </div>
    )}
    {children}
  </section>
)

export const PageHead = ({ title, sub, action }) => (
  <div className="page-head between wrap">
    <div>
      <h1 className="page-title">{title}</h1>
      {sub && <p className="page-sub">{sub}</p>}
    </div>
    {action}
  </div>
)

export const Delta = ({ v }) => (
  <span className={`delta ${v >= 0 ? 'up' : 'down'}`}>
    <Icon.arrowUp style={v < 0 ? { transform: 'rotate(180deg)' } : undefined} />
    {v >= 0 ? '+' : ''}{v}%
  </span>
)

export const Stat = ({ label, value, delta, icon }) => {
  const I = icon ? Icon[icon] : null
  return (
    <div className="stat">
      {I && <div className="ic"><I /></div>}
      <div className="lbl">{label}</div>
      <div className="row">
        <div className="val">{value}</div>
        {delta != null && <Delta v={delta} />}
      </div>
    </div>
  )
}

export const Badge = ({ children, kind = 'sage', dot }) => (
  <span className={`badge ${kind} ${dot ? 'dot' : ''}`}>
    {dot && <span className="b-dot" style={{ background: dot }} />}
    {children}
  </span>
)

export const Chip = ({ children, kind = '' }) => <span className={`chip ${kind}`}>{children}</span>

export const Avatar = ({ text, size = '', gold }) => (
  <div className={`avatar ${size} ${gold ? 'gold' : ''}`}>{text}</div>
)

export const Button = ({ variant = 'primary', sm, block, icon, children, ...p }) => {
  const I = icon ? Icon[icon] : null
  return (
    <button className={`btn btn-${variant} ${sm ? 'btn-sm' : ''} ${block ? 'btn-block' : ''}`} {...p}>
      {I && <I />}{children}
    </button>
  )
}

export const Progress = ({ value, kind = '' }) => (
  <div className={`progress ${kind}`}><span style={{ width: `${Math.min(100, value)}%` }} /></div>
)

export function Modal({ title, sub, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${wide ? 'wide' : ''}`}>
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            {sub && <p>{sub}</p>}
          </div>
          <button className="x-btn" onClick={onClose}><Icon.x /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export const Helper = ({ children }) => (
  <div className="helper"><Icon.info /><div>{children}</div></div>
)

export const Empty = ({ children }) => (
  <div className="empty"><Icon.search /><div>{children}</div></div>
)
