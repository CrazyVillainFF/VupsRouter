import React, { useMemo, useEffect, useState } from 'react';
import './SplitText.css';

/**
 * React Bits SplitText Component (CSS-driven implementation)
 * Splits text into individual animated characters or words with staggered delay.
 * Fully compatible with React Bits SplitText API.
 */
export const SplitText = ({
  text = '',
  className = '',
  delay = 40,
  duration = 0.6,
  splitType = 'chars', // 'chars' | 'words'
  tag: Tag = 'h1',
  textAlign = 'center',
  onLetterAnimationComplete,
  reducedMotion = false
}) => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Trigger animation immediately or on mount
    const timer = setTimeout(() => {
      setInView(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const items = useMemo(() => {
    if (!text) return [];
    if (splitType === 'words') {
      return text.split(' ').map((word, i) => ({
        id: `word-${i}`,
        content: word,
        isSpace: false
      }));
    }

    // Default to character splitting while preserving spaces
    return text.split('').map((char, i) => ({
      id: `char-${i}`,
      content: char,
      isSpace: char === ' '
    }));
  }, [text, splitType]);

  if (reducedMotion) {
    return (
      <Tag className={`split-text-wrapper ${className}`} style={{ textAlign }}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag className={`split-text-wrapper ${className}`} style={{ textAlign }}>
      {items.map((item, index) => {
        if (item.isSpace) {
          return (
            <span key={item.id} className="split-space">
              &nbsp;
            </span>
          );
        }

        const itemDelay = (index * delay) / 1000;

        return (
          <span
            key={item.id}
            className={`split-item ${inView ? 'split-visible' : ''}`}
            style={{
              transitionDelay: `${itemDelay}s`,
              transitionDuration: `${duration}s`
            }}
            onTransitionEnd={
              index === items.length - 1 && onLetterAnimationComplete
                ? () => onLetterAnimationComplete()
                : undefined
            }
          >
            {item.content}
          </span>
        );
      })}
    </Tag>
  );
};

export default SplitText;
