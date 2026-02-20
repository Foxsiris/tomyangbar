import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function AnimatedListItem({ children }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 40 }}
      layout
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

export const AnimatedList = React.memo(({ children, className = '', delay = 1000, ...props }) => {
  const [index, setIndex] = useState(0);
  const childrenArray = useMemo(() => React.Children.toArray(children), [children]);

  useEffect(() => {
    if (childrenArray.length === 0) return;
    if (index < childrenArray.length - 1) {
      const timeout = setTimeout(() => {
        setIndex((prevIndex) => Math.min(prevIndex + 1, childrenArray.length - 1));
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [index, delay, childrenArray.length]);

  const itemsToShow = useMemo(() => {
    return childrenArray.slice(0, index + 1);
  }, [index, childrenArray]);

  if (childrenArray.length === 0) return null;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`} {...props}>
      <AnimatePresence mode="popLayout">
        {itemsToShow.map((item) => (
          <AnimatedListItem key={item.key}>
            {item}
          </AnimatedListItem>
        ))}
      </AnimatePresence>
    </div>
  );
});

AnimatedList.displayName = 'AnimatedList';
