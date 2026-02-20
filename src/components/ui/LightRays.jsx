const LightRays = ({
  raysOrigin = 'right',
  color = 'rgba(220, 38, 38, 0.35)',
  className = '',
}) => {
  const cx = raysOrigin === 'right' ? '100%' : '0%';

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse 150% 100% at ${cx} 50%,
            rgba(220, 38, 38, 0.4) 0%,
            rgba(220, 38, 38, 0.25) 25%,
            rgba(220, 38, 38, 0.12) 50%,
            transparent 75%
          )`,
        }}
      />
    </div>
  );
};

export default LightRays;
