import { Link } from 'react-router-dom';
import { Play, X } from 'lucide-react';
import ProxyImage from './ProxyImage';
import { useContinueWatching, ContinueWatchingItem } from '../hooks/useContinueWatching';

export default function ContinueWatching() {
  const { items, removeItem } = useContinueWatching();

  if (items.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-xl md:text-2xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
        Continue Watching
      </h2>

      {/* Horizontal Scroll Layout */}
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
        {items.map((item) => (
          <div 
            key={item.animeId} 
            className="snap-start shrink-0 w-64 md:w-72 bg-[#1e1e24] rounded-lg overflow-hidden border border-white/5 relative group"
          >
            <Link to={`/watch/${item.animeId}/${item.epId}`} className="block relative aspect-video overflow-hidden bg-[#0a0a0c]">
              <ProxyImage
                srcUrl={item.image}
                alt={item.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center">
                 <div className="w-10 h-10 rounded-full bg-[#fca311]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 shadow-[0_0_15px_rgba(252,163,17,0.5)]">
                   <Play className="w-4 h-4 text-zinc-950 ml-1" fill="currentColor" />
                 </div>
              </div>
            </Link>

            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeItem(item.animeId); }}
              className="absolute top-2 right-2 bg-black/60 p-1.5 rounded text-zinc-400 hover:text-white hover:bg-black transition-colors z-10 opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-3">
              <Link to={`/watch/${item.animeId}/${item.epId}`} className="flex flex-col gap-1">
                <h3 className="font-bold text-white text-sm truncate uppercase tracking-wider">{item.title}</h3>
                <span className="text-zinc-400 text-xs font-semibold">
                  EP {item.epNumber}
                  {item.time > 0 ? ` • ${Math.floor(item.time / 60)}m ${Math.floor(item.time % 60)}s` : ''}
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
