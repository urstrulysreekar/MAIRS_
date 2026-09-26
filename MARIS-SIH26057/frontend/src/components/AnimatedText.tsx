'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedTextProps {
  words?: string[];
  intervalMs?: number;
  className?: string;
}

const DEFAULT_KEYWORDS = [
  'Ghost Nets',
  'Wreck Debris',
  'Unexploded Ordnance',
  'Submarine Pipelines',
  'Historic Shipwrecks',
  'Acoustic Anomalies',
];

export default function AnimatedText({
  words = DEFAULT_KEYWORDS,
  intervalMs = 3000,
  className = '',
}: AnimatedTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [words.length, intervalMs]);

  return (
    <span className={`inline-flex items-center overflow-hidden align-baseline ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-[#3b7b99]"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
      <span className="ml-1 inline-block h-[0.85em] w-[2px] bg-[#3b7b99] align-middle opacity-90" />
    </span>
  );
}
