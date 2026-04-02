"use client";

import { useState } from "react";

type ListingImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function ListingImage({
  src,
  alt,
  className,
  style,
}: ListingImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
