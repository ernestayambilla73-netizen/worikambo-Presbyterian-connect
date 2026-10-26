"use client";

import { useState } from "react";

type Props = { src?: string; label: string; alt: string };

export default function MinistryLogo({ src, label, alt }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <span className="ministry-logo ministry-logo-monogram" role="img" aria-label={alt}>{label}</span>;
  }
  return <img className="ministry-logo" src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
