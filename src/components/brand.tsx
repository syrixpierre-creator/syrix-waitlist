export const SyrixLogo = ({ size = 32 }: { size?: number }) => <img src="/brand/syrix.png" width={size} height={size} alt="SYRIX" style={{ width: size, height: size, objectFit: 'contain' }} />;

/** WhaRise mark: a rising arrow over bars, in the app's cream-on-black style. */
export const WhaRiseLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="WhaRise">
    <rect width="40" height="40" rx="11" fill="#efe9dd" />
    <rect x="9" y="24" width="4" height="7" rx="1.5" fill="#0b0b0c" />
    <rect x="16" y="20" width="4" height="11" rx="1.5" fill="#0b0b0c" />
    <rect x="23" y="16" width="4" height="15" rx="1.5" fill="#0b0b0c" />
    <path d="M8 19 L18 12 L23 15 L31 9" stroke="#34d27b" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M26 8.5 L31.5 8.5 L31.5 14" stroke="#34d27b" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HUES = ['#3a6bc9', '#2f7d70', '#a8642c', '#b04a5e', '#5a7f30', '#6c58b8'];
export const Avatar = ({ name, size = 30 }: { name: string; size?: number }) => {
  const c = HUES[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % HUES.length];
  return (
    <span className="av" style={{ width: size, height: size, fontSize: size * 0.4, background: `color-mix(in srgb, ${c} 24%, #15171c)`, color: `color-mix(in srgb, ${c} 70%, #fff)` }}>
      {name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
    </span>
  );
};
