/**
 * A plain (non-reactive) singleton for high-frequency scroll synchronization.
 * Updates directly inside scroll event loops and is read in R3F useFrame ticks
 * without triggering React re-renders.
 */
export const scrollProgress = {
  /** 0 to 1 progress within pinned hero or active scene */
  value: 0,
  /** 0 to 1 normalized progress across the entire page */
  globalValue: 0,
  /** Active scene index: 1 (Hero), 2 (Split), 3 (Data Protection), 4 (Eclipse), 5 (Globe), 6 (Closing) */
  activeScene: 1,
};
