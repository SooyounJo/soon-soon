/**
 * 순회 텍스트 — CSS 애니만 사용 (motion/WebGL 대비 메인 스레드·GPU 부하 감소)
 */
export default function CircularText({
  text,
  spinDuration = 20,
  className = '',
}) {
  const letters = Array.from(text);
  const durStyle = {
    ['--circular-text-spin']: `${spinDuration}s`,
  };

  return (
    <div
      className={`circular-text circular-text--css-spin ${className}`}
      style={durStyle}
    >
      {letters.map((letter, i) => {
        const rotationDeg = (360 / letters.length) * i;
        const transform = `rotate(${rotationDeg}deg) translateY(-98px)`;

        return (
          <span key={`${letter}-${i}`} style={{ transform, WebkitTransform: transform }}>
            {letter}
          </span>
        );
      })}
    </div>
  );
}
