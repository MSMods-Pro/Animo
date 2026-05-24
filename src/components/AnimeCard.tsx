import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
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
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <Play className="w-5 h-5 text-white ml-1" />
          </div>
        </div>

        {/* Episode Badge if exists */}
        {episodeNumber ? (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/90 backdrop-blur-sm rounded text-xs font-semibold text-orange-400">
            EP {episodeNumber}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1 px-1">
        <h3 className="font-semibold text-sm line-clamp-2 text-zinc-100 group-hover:text-orange-400 transition-colors">
          {title}
        </h3>
        {anime.type && (
          <span className="text-xs text-zinc-500">{anime.type}</span>
        )}
      </div>
    </Link>
  );
}
