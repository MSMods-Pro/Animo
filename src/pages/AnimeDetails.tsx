import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { animeApi } from '../lib/api';
import { AnimeDetails as IAnimeDetails, Episode, Anime } from '../types';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import ProxyImage from '../components/ProxyImage';
import AnimeCard from '../components/AnimeCard';
import { PlayCircle, Calendar, ListVideo, Play } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AnimeDetails() {
  const { id } = useParams<{ id: string }>();
  
  const [details, setDetails] = useState<IAnimeDetails | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [franchise, setFranchise] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      
      const [infoData, episodesData] = await Promise.all([
        animeApi.getAnimeInfo(id),
        animeApi.getEpisodes(id)
      ]);
      
      setDetails(infoData);
      setEpisodes(episodesData);

      // Search for franchise
      if (infoData?.title) {
        // use a short version of the title to get better results
        const shortTitle = infoData.title.split(':')[0].trim();
        const searchRes = await animeApi.searchAnime(shortTitle);
        // filter out exact current id if needed, but keeping it helps user see where they are
        setFranchise(searchRes || []);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load anime details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!details) return <ErrorState message="Anime not found. Maybe the API endpoint dropped the connection or ID is invalid." onRetry={fetchData} />;

  const firstEpisode = episodes.length > 0 ? episodes[0] : null;

  return (
    <div className="min-h-screen pt-8 pb-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8 items-start">
        {/* Poster */}
        <div className="w-48 md:w-56 shrink-0 mx-auto md:mx-0">
          <ProxyImage 
            srcUrl={details.image} 
            alt={details.title}
            className="w-full aspect-[3/4] object-cover rounded-lg shadow-xl border border-white/5"
          />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left mt-2">
          <h1 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
            {details.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-xs text-zinc-300 font-bold uppercase tracking-wider">
            {details.releaseDate && (
              <span className="flex items-center gap-1.5 bg-[#1e1e24] px-3 py-1.5 rounded border border-white/5">
                <Calendar className="w-3.5 h-3.5 text-[#fca311]" />
                {details.releaseDate}
              </span>
            )}
            <span className={cn(
              "px-3 py-1.5 rounded border border-white/5",
              details.status?.toLowerCase().includes('ongoing') 
                ? "bg-[#fca311]/10 text-[#fca311]" 
                : "bg-emerald-500/10 text-emerald-400"
            )}>
              {details.status || 'Completed'}
            </span>
            <span className="flex items-center gap-1.5 bg-[#1e1e24] px-3 py-1.5 rounded border border-white/5">
              <ListVideo className="w-3.5 h-3.5 text-[#fca311]" />
              {details.totalEpisodes ?? episodes.length} EPS
            </span>
          </div>

          {firstEpisode && (
             <Link 
               to={`/watch/${id}/${firstEpisode.id}`}
               className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#fca311] hover:bg-[#e6940f] text-zinc-950 font-bold uppercase tracking-wider text-sm rounded transition-transform hover:scale-105 shadow-[0_0_15px_rgba(252,163,17,0.3)] mb-8"
             >
               <Play className="w-4 h-4 fill-current" />
               Watch Now
             </Link>
          )}

          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
            {details.genres?.map(genre => (
              <span key={genre} className="text-[10px] font-bold text-zinc-400 bg-black/40 px-2 py-1 rounded border border-white/5 uppercase tracking-widest">
                {genre}
              </span>
            ))}
          </div>

          <p className="text-zinc-400 leading-relaxed md:max-w-3xl mb-12 text-sm font-medium">
            {details.description || 'No description available for this anime.'}
          </p>
        </div>
      </div>

      {/* Recommendations & Related Sections */}
      <div className="container mx-auto px-4 mt-8 md:mt-12 pb-12 flex flex-col gap-10">
        
        {franchise && franchise.length > 0 && (
          <div>
            <h2 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              All Seasons & Movies
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
              {franchise.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          </div>
        )}

        {details.related && details.related.length > 0 && (
          <div>
            <h2 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2 border-t border-white/5 pt-8">
              Related Anime
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
              {details.related.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          </div>
        )}

        {details.recommendations && details.recommendations.length > 0 && (
          <div>
            <h2 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2 border-t border-white/5 pt-8">
              Recommendations
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
              {details.recommendations.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
