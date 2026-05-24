import { Link } from 'react-router-dom';
import { Play, Captions, Mic } from 'lucide-react';
import { Anime } from '../types';
import ProxyImage from './ProxyImage';

interface AnimeCardProps {
  anime: Anime;
  key?: string | number;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  const title = anime?.title ?? 'Unknown Title';
  const rawImage = anime?.image ?? '';
  const episodeNumber = anime?.episodeNumber;

  return (
    <Link 
      to={`/anime/${anime.id}`}
      className="group relative flex flex-col gap-2 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-900">
        <ProxyImage
          srcUrl={rawImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <div className="w-12 h-12 rounded-full bg-[#fca311] flex items-center justify-center shadow-[0_0_15px_rgba(252,163,17,0.5)] translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <Play className="w-5 h-5 text-zinc-950 ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Labels / Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
          {anime.type && (
             <div className="px-2 py-0.5 bg-[#fca311] text-zinc-950 rounded text-[10px] font-bold tracking-wide uppercase shadow-sm">
                {anime.type}
             </div>
          )}
        </div>
        
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-20">
          {anime.sub ? (
             <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] font-bold text-white shadow-sm">
                <Captions className="w-3 h-3 text-[#fca311]" />
                {anime.sub}
             </div>
          ) : null}
          {anime.dub ? (
             <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] font-bold text-white shadow-sm">
                <Mic className="w-3 h-3 text-[#fca311]" />
                {anime.dub}
             </div>
          ) : null}
        </div>

        {/* Episode Badge if exists */}
        {episodeNumber ? (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm shadow-sm rounded text-[10px] font-bold text-[#fca311] z-20">
            EP {episodeNumber}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1 px-1 mt-1">
        <h3 className="font-semibold text-sm line-clamp-2 text-zinc-100 group-hover:text-[#fca311] transition-colors leading-tight">
          {title}
        </h3>
      </div>
    </Link>
  );
}
