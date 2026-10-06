const STAR = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z';

const Svg = ({ size = 20, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...rest}>{children}</svg>
);
const Line = ({ color = 'currentColor', width = 2, ...rest }) => ({
  fill: 'none', stroke: color, strokeWidth: width, strokeLinecap: 'round', strokeLinejoin: 'round', ...rest,
});

export const Star = ({ size = 16, color = '#FFB547' }) => <Svg size={size} fill={color}><path d={STAR} /></Svg>;
export const Stars = ({ n = 5, size = 16, gap = 2 }) => (
  <span style={{ display: 'inline-flex', gap }} aria-label={`${n} stars`}>
    {Array.from({ length: 5 }, (_, i) => <Star key={i} size={size} color={i < n ? '#FFB547' : '#E5E1EA'} />)}
  </span>
);
export const Check = ({ size = 16, color = '#16A34A', ...rest }) => <Svg size={size} {...Line({ color, width: 2.5 })} {...rest}><path d="M20 6 9 17l-5-5" /></Svg>;
export const Arrow = ({ size = 18, color = '#FF5C7A' }) => <Svg size={size} {...Line({ color, width: 2.5 })}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
export const Chat = ({ size = 18, color = '#5B2A86' }) => <Svg size={size} {...Line({ color })}><path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-6.2A8 8 0 1 1 21 12z" /></Svg>;
export const Menu = ({ size = 22, color = '#1B2440' }) => <Svg size={size} {...Line({ color })}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>;
export const Close = ({ size = 20, color = '#1B2440' }) => <Svg size={size} {...Line({ color })}><path d="M18 6 6 18M6 6l12 12" /></Svg>;
export const Search = ({ size = 18, color = '#5F6673' }) => <Svg size={size} {...Line({ color })}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
export const Shield = ({ size = 20, color = '#D63A7E' }) => <Svg size={size} {...Line({ color })}><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /><path d="m9 12 2 2 4-4" /></Svg>;
export const Play = ({ size = 30, color = '#5B2A86' }) => <Svg size={size} fill={color}><path d="M8 5.5v13l11-6.5z" /></Svg>;
export const PhoneOff = ({ size = 32, color = '#FF5C7A' }) => <Svg size={size} {...Line({ color })}><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M10.5 18.5h3" /><path d="M9.5 9.5l5 5M14.5 9.5l-5 5" /></Svg>;
export const Chair = ({ size = 32, color = '#FF5C7A' }) => <Svg size={size} {...Line({ color })}><path d="M7 3h10v7H7z" /><path d="M5 10h14v4H5z" /><path d="M12 14v4M8 21h8M12 18v3" /></Svg>;
export const Calendar = ({ size = 32, color = '#FF5C7A' }) => <Svg size={size} {...Line({ color })}><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /><path d="M7 13.5h2M15 13.5h2M7 17h2" /></Svg>;
export const Home = ({ size = 20, color = 'currentColor' }) => <Svg size={size} {...Line({ color })}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10" /></Svg>;
export const Users = ({ size = 20, color = 'currentColor' }) => <Svg size={size} {...Line({ color })}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /><path d="M16 4.8a3.4 3.4 0 0 1 0 6.4M18.5 14.8c1.7.8 2.7 2.5 3 5.2" /></Svg>;
export const StarLine = ({ size = 20, color = 'currentColor' }) => <Svg size={size} {...Line({ color })}><path d={STAR} /></Svg>;
export const Edit = ({ size = 20, color = 'currentColor' }) => <Svg size={size} {...Line({ color })}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></Svg>;
export const Gear = ({ size = 20, color = 'currentColor' }) => <Svg size={size} {...Line({ color })}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></Svg>;
export const Plus = ({ size = 18, color = 'currentColor' }) => <Svg size={size} {...Line({ color, width: 2.5 })}><path d="M12 5v14M5 12h14" /></Svg>;
export const Send = ({ size = 18, color = 'currentColor' }) => <Svg size={size} {...Line({ color })}><path d="M21 3 10 14" /><path d="m21 3-7 18-4-7-7-4z" /></Svg>;
export const Copy = ({ size = 18, color = 'currentColor' }) => <Svg size={size} {...Line({ color })}><rect x="8" y="8" width="13" height="13" rx="3" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></Svg>;
export const Upload = ({ size = 18, color = 'currentColor' }) => <Svg size={size} {...Line({ color })}><path d="M12 15V3M7 8l5-5 5 5" /><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></Svg>;
export const Trash = ({ size = 18, color = 'currentColor' }) => <Svg size={size} {...Line({ color })}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></Svg>;
export const Back = ({ size = 18, color = 'currentColor' }) => <Svg size={size} {...Line({ color })}><path d="M19 12H5M11 18l-6-6 6-6" /></Svg>;
export const Heart = ({ size = 18, color = 'currentColor' }) => <Svg size={size} {...Line({ color })}><path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.6 3.8 4.5 7 4.5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.2 0 5.3 3.1 4.2 6.2C19.5 15.4 12 20 12 20z" /></Svg>;
export const External = ({ size = 16, color = 'currentColor' }) => <Svg size={size} {...Line({ color })}><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></Svg>;

export function Logo({ size = 34, text = true, color = '#1B2440', fontSize = 26 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color }}>
      <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--rainbow)', display: 'grid', placeItems: 'center', flex: 'none' }}>
        <svg width={size * 0.53} height={size * 0.53} viewBox="0 0 24 24" fill="#FFD166" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><path d={STAR} /></svg>
      </span>
      {text && <span className="serif" style={{ fontSize, lineHeight: 1 }}>GlowBack</span>}
    </span>
  );
}
