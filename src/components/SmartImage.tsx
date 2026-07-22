'use client';

import { useState } from 'react';

/**
 * Image with graceful fallback: if the primary source fails to load
 * (e.g. LoremFlickr blocked), it swaps to a deterministic picsum photo
 * so the UI never shows a broken image icon.
 */
export default function SmartImage({
  src,
  alt,
  className = '',
  seed,
  fallback = 'https://picsum.photos/seed/xianlu/800/800',
}: {
  src: string;
  alt: string;
  className?: string;
  seed?: string;
  fallback?: string;
}) {
  const [errored, setErrored] = useState(false);
  const finalSrc = errored ? (seed ? `https://picsum.photos/seed/${seed}/800/800` : fallback) : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => {
        if (!errored) setErrored(true);
      }}
    />
  );
}
