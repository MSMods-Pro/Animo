import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { SubtitleTrack } from '../types';
import { getProxiedM3U8, getProxiedCors } from '../lib/proxy';

interface HLSPlayerProps {
  url: string;
  tracks?: SubtitleTrack[];
  referer?: string;
}

export default function HLSPlayer({ url, tracks, referer }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlIndex, setUrlIndex] = useState(0);

  useEffect(() => {
    setUrlIndex(0);
    setError(null);
  }, [url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    const urlsToTry = [
      `/api/m3u8-proxy?url=${encodeURIComponent(url)}&referer=${encodeURIComponent(referer || '')}`,
      getProxiedM3U8(url), // Try secondary m3u8 proxy
      url, // Direct url might just work
      getProxiedCors(url) // Try generic cors proxy as last resort
    ];

    const currentUrl = urlsToTry[urlIndex];
    if (!currentUrl) {
      setError('All playback methods failed.');
      return;
    }

    let hls: Hls | null = null;

    try {
      if (Hls.isSupported()) {
        hls = new Hls({ maxMaxBufferLength: 60 });
        hls.loadSource(currentUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((err) => {
            console.warn('Auto-play prevented by browser:', err);
          });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (urlIndex < urlsToTry.length - 1) {
                   hls?.destroy();
                   setUrlIndex(prev => prev + 1);
                } else {
                   setError('Network error encountered while loading video.');
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError();
                break;
              default:
                if (urlIndex < urlsToTry.length - 1) {
                   hls?.destroy();
                   setUrlIndex(prev => prev + 1);
                } else {
                   hls?.destroy();
                   setError('A fatal video playback error occurred.');
                }
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = currentUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch((err) => console.warn('Auto-play prevented:', err));
        });
        video.addEventListener('error', () => {
           if (urlIndex < urlsToTry.length - 1) {
             setUrlIndex(prev => prev + 1);
           } else {
             setError('Playback error on Apple device.');
           }
        });
      }
    } catch (err: any) {
       if (urlIndex < urlsToTry.length - 1) {
         setUrlIndex(prev => prev + 1);
       } else {
         setError(err.message || 'Failed to initialize player.');
       }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url, urlIndex]);

  if (error) {
    return (
      <div className="w-full aspect-video bg-[#1e1e24] flex items-center justify-center p-4 text-center border-t border-b sm:border border-[#fca311]/20">
        <div className="flex flex-col gap-2">
          <p className="text-red-400 font-bold tracking-wider uppercase">Playback Error</p>
          <p className="text-zinc-400 text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black relative aspect-video shadow-2xl">
      <video
        ref={videoRef}
        controls
        className="w-full h-full object-contain"
        crossOrigin="anonymous"
        playsInline
      >
        {tracks?.map((track, index) => {
          if (!track.file) return null;
          const proxiedTrackUrl = getProxiedCors(track.file);
          return (
            <track
              key={index}
              kind={track.kind || 'subtitles'}
              label={track.label || `Track ${index + 1}`}
              src={proxiedTrackUrl}
              srcLang={track.label?.substring(0, 2).toLowerCase() || 'en'}
              default={track.default || index === 0}
            />
          );
        })}
      </video>
    </div>
  );
}
