import React, { useState, useEffect, ImgHTMLAttributes } from 'react';
import { getProxiedCors, getProxiedFallback } from '../lib/proxy';

interface ProxyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  srcUrl: string;
  alt?: string;
  className?: string;
}

export default function ProxyImage({ srcUrl, ...props }: ProxyImageProps) {
  const [src, setSrc] = useState<string | undefined>(srcUrl ? getProxiedCors(srcUrl) : undefined);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (srcUrl) {
      setSrc(getProxiedCors(srcUrl));
      setFailed(false);
    } else {
      setSrc(undefined);
    }
  }, [srcUrl]);

  const handleError = () => {
    if (!failed && srcUrl) {
      setFailed(true);
      setSrc(getProxiedFallback(srcUrl));
    }
  };

  if (!src) return null;

  return (
    <img
      src={src}
      onError={handleError}
      {...props}
    />
  );
}
