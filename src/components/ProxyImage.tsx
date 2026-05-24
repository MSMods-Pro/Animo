import React, { useState, useEffect, ImgHTMLAttributes } from 'react';
import { getProxiedCors, getProxiedFallback } from '../lib/proxy';

interface ProxyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  srcUrl: string;
  alt?: string;
  className?: string;
}

export default function ProxyImage({ srcUrl, ...props }: ProxyImageProps) {
  const [src, setSrc] = useState<string | undefined>(srcUrl || undefined);
  const [failCount, setFailCount] = useState(0);

  useEffect(() => {
    if (srcUrl) {
      setSrc(srcUrl); // Try direct URL first
      setFailCount(0);
    } else {
      setSrc(undefined);
    }
  }, [srcUrl]);

  const handleError = () => {
    if (!srcUrl) return;
    if (failCount === 0) {
      setFailCount(1);
      setSrc(getProxiedCors(srcUrl)); // Second try
    } else if (failCount === 1) {
      setFailCount(2);
      setSrc(getProxiedFallback(srcUrl)); // Third try
    }
  };

  if (!src) return null;

  return (
    <img
      src={src}
      onError={handleError}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
