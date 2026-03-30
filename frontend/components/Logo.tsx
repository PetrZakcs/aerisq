export default function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="100" cy="100" r="70" stroke="#fff" strokeWidth="18" />
      {/* Needle pointing bottom right from center */}
      <path d="M90 90 L185 185 L160 195 Z" fill="#fff" />
      <text x="105" y="230" textAnchor="middle" fill="#fff" style={{fontFamily: 'var(--font-space-mono)', fontWeight: 800, fontSize: '38px', letterSpacing: '0.15em'}}>PHASQ</text>
    </svg>
  );
}
