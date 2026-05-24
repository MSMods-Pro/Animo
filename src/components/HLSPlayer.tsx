import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { SubtitleTrack } from '../types';
import { getProxiedM3U8, getProxiedCors } from '../lib/proxy';

interface HLSPlayerProps {
  url: string;
  tracks?: SubtitleTrack[];
}

export default function HLSPlayer({ url, tracks }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | null = null;
    const proxiedUrl = getProxiedM3U8(url);

    try {
      if (Hls.isSupported()) {
        hls = new Hls({ maxMaxBufferLength: 60 });

        hls.loadSource(proxiedUrl);
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
                setError('Network error encountered while loading video.');
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError('Media error encountered. Trying to recover...');
                hls?.recoverMediaError();
                break;
              default:
                hls?.destroy();
                setError('A fatal video playback error occurred.');
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = proxiedUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch((err) => console.warn('Auto-play prevented:', err));
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize player.');
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  if (error) {
    return (
      <div className="w-full aspect-video bg-zinc-900 rounded-lg flex items-center justify-center p-4 text-center border border-red-500/20">
        <div className="flex flex-col gap-2">
          <p className="text-red-400 font-medium text-sm sm:text-base">Playback Error</p>
          <p className="text-zinc-400 text-xs sm:text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden bg-black shadow-2xl relative aspect-video">
      <video
        ref={videoRef}
        controls
        className="w-full h-full"
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
