import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { animeApi } from '../lib/api';
import { Anime } from '../types';
import AnimeCard from '../components/AnimeCard';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import ProxyImage from '../components/ProxyImage';
import { Flame, Play, Clock, TrendingUp } from 'lucide-react';

export default function Home() {
  const [recent, setRecent] = useState<Anime[]>([]);
  const [trending, setTrending] = useState<Anime[]>([]);
  const [popular, setPopular] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const fetchAnime = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch arrays independently so one failing doesn't break the whole app
      const recentPromise = animeApi.getLatestEpisodes().catch(() => []);
      const trendingPromise = animeApi.getCategoryAnime('ongoing').catch(() => []);
      const popularPromise = animeApi.getCategoryAnime('popular').catch(() => []);
      
      const [recentData, trendingData, popularData] = await Promise.all([
        recentPromise,
        trendingPromise,
        popularPromise
      ]);
      
      setRecent(recentData || []);
      setTrending(trendingData ? trendingData.slice(0, 12) : []); 
      setPopular(popularData ? popularData.slice(0, 12) : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch anime');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime();
  }, []);

  // Hero Slider Auto-Play
  useEffect(() => {
    let heroSource = recent;
    if (recent.length === 0) {
      if (trending.length > 0) heroSource = trending;
      else if (popular.length > 0) heroSource = popular;
    }
    const sliderItems = heroSource.slice(0, 5);
    if (sliderItems.length === 0) return;
    
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % sliderItems.length);
    }, 5000); // 5 seconds per slide
    
    return () => clearInterval(interval);
  }, [recent, trending, popular]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={fetchAnime} />;

  let heroSource = recent;
  if (recent.length === 0) {
    if (trending.length > 0) heroSource = trending;
    else if (popular.length > 0) heroSource = popular;
  }

  const heroItems = heroSource.slice(0, 5);
  const heroAnime = heroItems[heroIndex] || heroSource[0];
  const gridRecent = recent.slice(5); // Show the rest in grid

  return (
    <div className="w-full pb-12">
      {/* Hero Slider Section */}
      {heroAnime && (
        <div className="relative w-full h-[60vh] min-h-[500px] bg-[#0a0a0c] mb-12 flex items-center overflow-hidden transition-all duration-700">
          <div key={heroAnime.id} className="absolute inset-0 animate-in fade-in duration-1000">
            <ProxyImage 
              srcUrl={heroAnime.image} 
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/60 to-transparent z-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f11] via-[#0f0f11]/80 to-transparent z-0" />
          
          <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-8">
             <div key={`poster-${heroAnime.id}`} className="hidden md:block w-52 shrink-0 rounded-lg overflow-hidden shadow-2xl shadow-[#fca311]/10 border border-white/10 group animate-in slide-in-from-left-8 duration-700 fade-in">
               <ProxyImage srcUrl={heroAnime.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
             </div>
             <div key={`info-${heroAnime.id}`} className="flex-1 animate-in slide-in-from-right-8 duration-700 fade-in">
                <span className="flex items-center gap-2 text-[#fca311] font-black tracking-widest text-sm mb-4 uppercase">
                  <Flame className="w-5 h-5" fill="currentColor" />
                  #1 Spotlight
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 line-clamp-2 leading-tight">
                  {heroAnime.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-8 text-xs md:text-sm font-bold tracking-wider">
                   {heroAnime.type && (
                     <span className="bg-white text-black px-2 py-1 rounded shadow-sm">{heroAnime.type}</span>
                   )}
                   {heroAnime.sub && (
                     <span className="flex items-center gap-1 bg-zinc-800/80 text-zinc-300 px-2 py-1 rounded">
                       SUB {heroAnime.sub}
                     </span>
                   )}
                   {heroAnime.dub && (
                     <span className="flex items-center gap-1 bg-zinc-800/80 text-zinc-300 px-2 py-1 rounded">
                       DUB {heroAnime.dub}
                     </span>
                   )}
                </div>
                <Link 
                  to={`/anime/${heroAnime.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#fca311] hover:bg-[#e6940f] text-zinc-950 font-black rounded-sm transition-transform hover:scale-105 shadow-[0_0_20px_rgba(252,163,17,0.3)] text-sm md:text-base uppercase tracking-wider"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  Start Watching
                </Link>
             </div>
          </div>

          {/* Slider Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {heroItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroIndex(idx)}
                className={`transition-all duration-300 rounded-full ${heroIndex === idx ? 'w-8 h-2 bg-[#fca311] shadow-[0_0_10px_rgba(252,163,17,0.5)]' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trending Section */}
      <div className="container mx-auto px-4 mb-16">
        <div className="flex items-center gap-2 mb-8 border-b border-zinc-800 pb-4">
          <TrendingUp className="w-6 h-6 text-[#fca311]" />
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Top Airing</h2>
        </div>
        
        {trending.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">No trending anime found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {trending.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </div>

      {/* Popular Section */}
      <div className="container mx-auto px-4 mb-16">
        <div className="flex items-center gap-2 mb-8 border-b border-zinc-800 pb-4">
          <Flame className="w-6 h-6 text-[#fca311]" />
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Most Popular</h2>
        </div>
        
        {popular.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">No popular anime found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {popular.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </div>

      {/* Recently Added Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex items-center gap-2 mb-8 border-b border-zinc-800 pb-4">
          <Clock className="w-6 h-6 text-[#fca311]" />
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Recently Added</h2>
        </div>
        
        {gridRecent.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">No more episodes found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {gridRecent.map((anime, i) => (
              <AnimeCard key={`${anime.id}-${anime.episodeNumber}-${i}`} anime={anime} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
