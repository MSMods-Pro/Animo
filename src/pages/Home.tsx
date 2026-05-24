import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { animeApi } from '../lib/api';
import { Anime } from '../types';
import AnimeCard from '../components/AnimeCard';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import ProxyImage from '../components/ProxyImage';
import { Flame, Play } from 'lucide-react';

export default function Home() {
  const [episodes, setEpisodes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEpisodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await animeApi.getLatestEpisodes();
      setEpisodes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch latest episodes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={fetchEpisodes} />;

  const heroAnime = episodes[0];
  const gridEpisodes = episodes.slice(1);

  return (
    <div className="w-full">
      {/* Hero Section */}
      {heroAnime && (
        <div className="relative w-full h-[50vh] min-h-[400px] bg-[#0a0a0c] mb-12 flex items-center">
          <ProxyImage 
            srcUrl={heroAnime.image} 
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f11] via-[#0f0f11]/80 to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-8">
             <div className="hidden md:block w-48 shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10">
               <ProxyImage srcUrl={heroAnime.image} className="w-full h-full object-cover" />
             </div>
             <div className="flex-1">
                <span className="text-[#fca311] font-bold tracking-wider text-sm mb-2 block uppercase">#1 Spotlight</span>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 line-clamp-2 leading-tight">
                  {heroAnime.title}
                </h1>
                <div className="flex items-center gap-3 mb-6 text-sm font-semibold">
                   {heroAnime.type && <span className="bg-white text-black px-2 py-0.5 rounded">{heroAnime.type}</span>}
                   {heroAnime.sub && <span className="text-zinc-300">SUB {heroAnime.sub}</span>}
                   {heroAnime.dub && <span className="text-zinc-300">DUB {heroAnime.dub}</span>}
                </div>
                <Link 
                  to={`/anime/${heroAnime.id}`}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#fca311] hover:bg-[#e6940f] text-zinc-950 font-bold rounded-full transition-transform hover:scale-105 shadow-[0_0_20px_rgba(252,163,17,0.4)]"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  Watch Now
                </Link>
             </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pb-12">
        <div className="flex items-center gap-2 mb-8 border-b border-zinc-800 pb-4">
          <Flame className="w-6 h-6 text-[#fca311]" />
          <h2 className="text-2xl font-bold text-white">Latest Episodes</h2>
        </div>
        
        {gridEpisodes.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">No more episodes found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {gridEpisodes.map((anime) => (
              <AnimeCard key={`${anime.id}-${anime.episodeNumber}`} anime={anime} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
