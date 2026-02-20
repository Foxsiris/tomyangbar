import { useState, useEffect } from 'react';

const TextType = ({
  text,
  speed = 80,
  delay = 0,
  cursor = true,
  className = '',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);

    const startTimeout = setTimeout(() => {
      let index = 0;

      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(typeInterval);
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && !isComplete && (
        <span
          className="inline-block w-[2px] h-[1em] bg-current align-middle ml-0.5"
          style={{
            animation: 'texttype-blink 1s step-end infinite',
          }}
        />
      )}
    </span>
  );
};

export default TextType;
