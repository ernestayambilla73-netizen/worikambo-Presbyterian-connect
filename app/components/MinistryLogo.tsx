"use client";

import { useState } from "react";

type Props = { src?: string; label: string; alt: string };

export default function MinistryLogo({ src, label, alt }: Props) {
  const [failed, setFailed] = useState(false);

  // Use official artwork when its image loads. If no verified image is
  // configured or a remote host blocks it, keep a consistent visible mark.
  if (!src || failed) {
    return (
      <span className="ministry-logo ministry-logo-monogram" role="img" aria-label={alt}>
        {label}
      </span>
    );
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
