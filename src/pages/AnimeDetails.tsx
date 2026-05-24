import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { animeApi } from '../lib/api';
import { AnimeDetails as IAnimeDetails, Episode } from '../types';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import ProxyImage from '../components/ProxyImage';
import { PlayCircle, Calendar, ListVideo, Play } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AnimeDetails() {
  const { id } = useParams<{ id: string }>();
  
  const [details, setDetails] = useState<IAnimeDetails | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
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
    <div className="min-h-screen pb-12">
      {/* Hero Header with Blur */}
      <div className="relative h-[40vh] min-h-[300px] w-full bg-[#0a0a0c] overflow-hidden">
        <ProxyImage 
          srcUrl={details.image} 
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover opacity-30 blur-md"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10 flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-48 md:w-64 shrink-0 mx-auto md:mx-0">
          <ProxyImage 
            srcUrl={details.image} 
            alt={details.title}
            className="w-full aspect-[3/4] object-cover rounded-lg shadow-2xl border border-white/10"
          />
        </div>

        {/* Info */}
        <div className="flex-1 mt-4 md:mt-16 flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {details.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm text-zinc-300 font-medium">
            {details.releaseDate && (
              <span className="flex items-center gap-1.5 bg-[#2a2a32] px-3 py-1 rounded">
                <Calendar className="w-4 h-4" />
                {details.releaseDate}
              </span>
            )}
            <span className={cn(
              "px-3 py-1 rounded font-bold uppercase text-xs tracking-wider",
              details.status?.toLowerCase().includes('ongoing') 
                ? "bg-[#fca311]/20 text-[#fca311]" 
                : "bg-emerald-500/20 text-emerald-400"
            )}>
              {details.status || 'Completed'}
            </span>
            <span className="flex items-center gap-1.5 bg-[#2a2a32] px-3 py-1 rounded">
              <ListVideo className="w-4 h-4" />
              {details.totalEpisodes ?? episodes.length} EPS
            </span>
          </div>

          {firstEpisode && (
             <Link 
               to={`/watch/${id}/${firstEpisode.id}`}
               className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#fca311] hover:bg-[#e6940f] text-zinc-950 font-bold rounded-full transition-transform hover:scale-105 shadow-[0_0_20px_rgba(252,163,17,0.4)] mb-8"
             >
               <Play className="w-5 h-5" fill="currentColor" />
               Watch Now
             </Link>
          )}

          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
            {details.genres?.map(genre => (
              <span key={genre} className="text-xs font-semibold text-zinc-300 bg-[#1e1e24] px-2.5 py-1 rounded border border-white/5 uppercase tracking-wider">
                {genre}
              </span>
            ))}
          </div>

          <p className="text-zinc-400 leading-relaxed md:max-w-4xl mb-12 text-sm sm:text-base">
            {details.description || 'No description available for this anime.'}
          </p>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="container mx-auto px-4 mt-8 md:mt-16">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
          Episodes <span className="text-zinc-500 font-medium text-lg">({episodes.length})</span>
        </h2>
        
        {episodes.length === 0 ? (
          <div className="text-zinc-500 p-8 bg-[#1e1e24] rounded border border-white/5 text-center">
            No episodes available currently.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {episodes.map((ep) => (
              <Link
                key={ep.id}
                to={`/watch/${id}/${ep.id}`}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded bg-[#1e1e24] border border-transparent transition-all duration-200 group text-center gap-2",
                  "hover:border-[#fca311] hover:bg-[#2a2a32]"
                )}
              >
                <div className="text-zinc-400 text-sm font-bold group-hover:text-white transition-colors">
                  EP {ep.number}
                </div>
                {ep.isFiller && (
                  <span className="text-[10px] uppercase font-bold text-zinc-500 w-min px-1.5 py-0.5 rounded bg-black tracking-wider">Filler</span>
                )}
                <PlayCircle className="w-6 h-6 text-zinc-600 group-hover:text-[#fca311] transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
