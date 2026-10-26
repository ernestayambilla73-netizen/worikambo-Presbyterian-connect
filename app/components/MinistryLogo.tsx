"use client";

import { useState } from "react";

type Props = { src?: string; label: string; alt: string };

// Use an image hosted by the official PCG Young People's Guild site as a
// resilient fallback whenever an external ministry image blocks hotlinking.
const fallbackSrc = "https://pcgypg.org/images/pcg-logo-lg.png";

export default function MinistryLogo({ src, label, alt }: Props) {
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  if (!src || failed) {
    if (!fallbackFailed) {
      return (
        <img
          className="ministry-logo ministry-logo-fallback"
          src={fallbackSrc}
          alt={`${alt} (Presbyterian Church emblem)`}
          loading="eager"
          onError={() => setFallbackFailed(true)}
        />
      );
    }
    return <span className="ministry-logo ministry-logo-monogram" role="img" aria-label={alt}>{label}</span>;
  }

  return (
    <img
      className="ministry-logo"
      src={src}
      alt={alt}
      loading="eager"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
