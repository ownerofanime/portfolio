export default function GlitchTransition() {
  return (
    <div className="glitch-overlay" aria-hidden="true">
      <div className="glitch-channel glitch-channel-r" />
      <div className="glitch-channel glitch-channel-g" />
      <div className="glitch-channel glitch-channel-b" />
      <div className="glitch-scanlines" />
      <div className="glitch-noise" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="glitch-tear"
          style={{ top: `${8 + i * 12}%`, animationDelay: `${i * 0.045}s` }}
        />
      ))}
      <div className="glitch-flash" />
    </div>
  );
}
