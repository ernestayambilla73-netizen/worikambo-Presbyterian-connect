"use client";

import { useState } from "react";

type Props = { src?: string; label: string; alt: string };

export default function MinistryLogo({ src, label, alt }: Props) {
  const [failed, setFailed] = useState(false);

  // Never invent or substitute an emblem. Use sourced artwork, and clearly
  // label ministries whose official logo has not yet been verified.
  if (!src || failed) {
    return (
      <span className="ministry-logo ministry-logo-monogram" role="img" aria-label={alt}>
        {failed ? "Logo unavailable" : `${label} logo pending`}
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
