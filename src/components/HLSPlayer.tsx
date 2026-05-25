import { useEffect, useRef, useState, useMemo } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { SubtitleTrack } from '../types';
import { getProxiedM3U8, getProxiedCors } from '../lib/proxy';

interface HLSPlayerProps {
  url: string;
  tracks?: SubtitleTrack[];
  referer?: string;
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
  animeId?: string;
  epId?: string;
}

export default function HLSPlayer({ url, tracks, referer, intro, outro, animeId, epId }: HLSPlayerProps) {
  const artRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlIndex, setUrlIndex] = useState(0);
  const playerRef = useRef<Artplayer | null>(null);

  const urlsToTry = useMemo(() => {
    if (!url) return [];
    return [
      `/api/m3u8-proxy?url=${encodeURIComponent(url)}&referer=${encodeURIComponent(referer || '')}`,
      getProxiedM3U8(url), // Try secondary m3u8 proxy
      url, // Direct url might just work
      getProxiedCors(url) // Try generic cors proxy as last resort
    ];
  }, [url, referer]);

  useEffect(() => {
    setUrlIndex(0);
    setError(null);
  }, [url]);

  useEffect(() => {
    const currentUrl = urlsToTry[urlIndex];
    if (!currentUrl || !artRef.current) return;

    // Subtitle conversion setup
    const subtitleOptions = tracks?.map((track, i) => ({
      html: track.label || `Track ${i + 1}`,
      url: getProxiedCors(track.file),
      default: track.default || i === 0,
    })) || [];

    const defaultSubtitle = subtitleOptions.find(s => s.default)?.url || subtitleOptions[0]?.url || '';

    let hls: Hls | null = null;
    const progressKey = `progress_${animeId}_${epId}`;
    const savedTime = localStorage.getItem(progressKey);

    const art = new Artplayer({
      container: artRef.current,
      url: currentUrl,
      type: 'm3u8',
      theme: '#fca311',
      volume: 1,
      isLive: false,
      muted: false,
      autoplay: true,
      pip: true,
      autoSize: false,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: false,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      hotkey: true,
      plugins: [],
      
      settings: subtitleOptions.length > 0 ? [
        {
          name: 'subtitle',
          width: 200,
          html: 'Subtitle',
          tooltip: subtitleOptions.find(s => s.default)?.html || subtitleOptions[0]?.html || 'None',
          icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18H20C21.1046 18 22 17.1046 22 16V8C22 6.89543 21.1046 6 20 6H4ZM4 8H20V16H4V8Z" fill="currentColor"/><path d="M6 10H10V12H6V10Z" fill="currentColor"/><path d="M14 10H18V12H14V10Z" fill="currentColor"/><path d="M6 14H18V16H6V14Z" fill="currentColor"/></svg>',
          selector: subtitleOptions,
          onSelect: function (item) {
            art.subtitle.switch(item.url, { name: item.html });
            return item.html;
          },
        },
      ] : [],

      subtitle: {
        url: defaultSubtitle,
        type: 'vtt',
        style: {
          color: '#fff',
          fontSize: '20px',
          textShadow: '0 0 5px #000, 0 0 5px #000',
        },
        encoding: 'utf-8',
      },

      customType: {
        m3u8: function (video, url, art) {
          if (Hls.isSupported()) {
            if (hls) hls.destroy();
            hls = new Hls({ maxMaxBufferLength: 60 });
            hls.loadSource(url);
            hls.attachMedia(video);

            // Fetch quality levels for quality switcher
            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
               if (data.levels && data.levels.length > 1) {
                  const qualityOptions = data.levels.map((level, index) => ({
                    html: level.height + 'p',
                    levelIndex: index,
                    default: index === data.levels.length - 1
                  })).reverse(); // highest quality first

                  qualityOptions.unshift({
                    html: 'Auto',
                    levelIndex: -1,
                    default: false
                  });

                  // Add Quality setting to menu
                  art.setting.add({
                    name: 'quality',
                    width: 200,
                    html: 'Quality',
                    tooltip: 'Auto',
                    selector: qualityOptions,
                    onSelect: function (item: any) {
                       if (hls) {
                         hls.currentLevel = item.levelIndex;
                       }
                       return item.html;
                    }
                  });
               }
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
               if (data.fatal) {
                 if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    if (urlIndex < urlsToTry.length - 1) {
                       hls?.destroy();
                       setUrlIndex(prev => prev + 1);
                    } else {
                       setError('Network error encountered while loading video.');
                    }
                 } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls?.recoverMediaError();
                 } else {
                    if (urlIndex < urlsToTry.length - 1) {
                       hls?.destroy();
                       setUrlIndex(prev => prev + 1);
                    } else {
                       hls?.destroy();
                       setError('A fatal video playback error occurred.');
                    }
                 }
               }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          } else {
            art.notice.show = 'Unsupported playback format';
          }
        },
      }
    });

    playerRef.current = art;

    // Load saved time if available
    art.on('ready', () => {
      if (savedTime && parseFloat(savedTime) > 0) {
         art.currentTime = parseFloat(savedTime);
      }
    });

    // Auto-save progress
    art.on('video:timeupdate', () => {
       const currentTime = art.currentTime;
       if (currentTime > 0) {
         localStorage.setItem(progressKey, currentTime.toString());
       }

       // Skip Intro Overlay
       if (intro && intro.start > 0 && intro.end > 0) {
          if (currentTime >= intro.start && currentTime <= intro.end) {
             if (!art.template.$skipIntroButton) {
                const btn = document.createElement('button');
                btn.className = 'absolute bottom-20 right-8 z-[90] bg-[#fca311] text-zinc-950 font-bold px-4 py-2 rounded shadow-lg uppercase tracking-wider text-sm hover:scale-105 transition-transform';
                btn.innerText = 'Skip Intro';
                btn.onclick = () => {
                   art.currentTime = intro.end;
                };
                art.template.$skipIntroButton = btn;
                art.template.$player.appendChild(btn);
             }
          } else {
             if (art.template.$skipIntroButton) {
                art.template.$player.removeChild(art.template.$skipIntroButton);
                delete art.template.$skipIntroButton;
             }
          }
       }
       
       // Skip Outro Overlay
       if (outro && outro.start > 0 && outro.end > 0) {
          if (currentTime >= outro.start && currentTime <= outro.end) {
             if (!art.template.$skipOutroButton) {
                const btn = document.createElement('button');
                btn.className = 'absolute bottom-20 right-8 z-[90] bg-[#fca311] text-zinc-950 font-bold px-4 py-2 rounded shadow-lg uppercase tracking-wider text-sm hover:scale-105 transition-transform';
                btn.innerText = 'Skip Outro';
                btn.onclick = () => {
                   art.currentTime = outro.end; // Skip to end or next episode
                };
                art.template.$skipOutroButton = btn;
                art.template.$player.appendChild(btn);
             }
          } else {
             if (art.template.$skipOutroButton) {
                art.template.$player.removeChild(art.template.$skipOutroButton);
                delete art.template.$skipOutroButton;
             }
          }
       }
    });

    art.on('error', (err) => {
       if (urlIndex < urlsToTry.length - 1) {
         setUrlIndex(prev => prev + 1);
       } else {
         setError('Failed to load media.');
       }
    });

    return () => {
      if (hls) {
        hls.destroy();
      }
      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, [urlIndex, urlsToTry, tracks, intro, outro, animeId, epId]);

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
      <div 
        ref={artRef} 
        className="w-full h-full"
      />
    </div>
  );
}
