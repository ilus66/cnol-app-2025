import createCache from '@emotion/cache';

const isBrowser = typeof document !== 'undefined';

// This function creates a new emotion cache for MUI styles.
// It's used for server-side rendering to inject styles in the correct order.
export default function createEmotionCache() {
  let insertionPoint;

  if (isBrowser) {
    const emotionInsertionPoint = document.querySelector('meta[name="emotion-insertion-point"]');
    insertionPoint = emotionInsertionPoint ?? undefined;
  }

  return createCache({ key: 'mui-style', insertionPoint });
} 