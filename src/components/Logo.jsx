import Icon from './icons.jsx'

// OscarSpa marka kilidi — yaprak amblemi + serif logotype
export default function Logo({ tagline = true, onLight }) {
  return (
    <div className="brand" style={{ padding: 0 }}>
      <svg className="brand-logo" viewBox="0 0 48 48" fill="none" aria-hidden>
        <path d="M24 42c0-11 5-19 15-24-2 12-7 20-15 24Z" fill="#2c4a38" />
        <path d="M24 42C24 30 18 22 8 18c2 12 8 20 16 24Z" fill="#7f9c77" />
        <path d="M24 42c1-9 6-16 14-20" stroke="#b8935a" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M24 42c-1-8-6-14-13-18" stroke="#b8935a" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <div>
        <div className="brand-name"><span className="b1">Oscar</span><span className="b2">Spa</span></div>
        {tagline && <div className="brand-tag">SPA'DA DİJİTAL DENGE</div>}
      </div>
    </div>
  )
}
