import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { animeApi } from '../lib/api';
import { AnimeDetails as IAnimeDetails, Episode } from '../types';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import ProxyImage from '../components/ProxyImage';
import { PlayCircle, Calendar, ListVideo } from 'lucide-react';
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
  if (!details) return <ErrorState message="Anime not found" />;

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Header with Blur */}
      <div className="relative h-[40vh] min-h-[300px] w-full bg-zinc-900 overflow-hidden">
        <ProxyImage 
          srcUrl={details.image} 
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10 flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-48 md:w-64 shrink-0 mx-auto md:mx-0">
          <ProxyImage 
            srcUrl={details.image} 
            alt={details.title}
            className="w-full aspect-[3/4] object-cover rounded-xl shadow-2xl border border-zinc-800"
          />
        </div>

        {/* Info */}
        <div className="flex-1 mt-4 md:mt-16 flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold text-zinc-100 mb-4 tracking-tight">
            {details.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm text-zinc-300">
            {details.releaseDate && (
              <span className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                <Calendar className="w-4 h-4" />
                {details.releaseDate}
              </span>
            )}
            <span className={cn(
              "px-3 py-1 rounded-full font-medium border",
              details.status?.toLowerCase().includes('ongoing') 
                ? "bg-orange-500/10 text-orange-400 border-orange-500/20" 
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            )}>
              {details.status || 'Completed'}
            </span>
            <span className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              <ListVideo className="w-4 h-4" />
              {details.totalEpisodes ?? episodes.length} EPS
            </span>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
            {details.genres?.map(genre => (
              <span key={genre} className="text-xs font-medium text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                {genre}
              </span>
            ))}
          </div>

          <p className="text-zinc-400 leading-relaxed md:max-w-3xl mb-12">
            {details.description || 'No description available for this anime.'}
          </p>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="container mx-auto px-4 mt-8 md:mt-16">
        <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
          Episodes <span className="text-zinc-500 font-normal text-lg">({episodes.length})</span>
        </h2>
        
        {episodes.length === 0 ? (
          <div className="text-zinc-500 p-8 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center">
            No episodes available currently.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {episodes.map((ep) => (
              <Link
                key={ep.id}
                to={`/watch/${id}/${ep.id}`}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all duration-200 group",
                  "bg-zinc-900 border-zinc-800 hover:border-orange-500 hover:bg-orange-500/5"
                )}
              >
                <div className="flex flex-col">
                  <span className="text-zinc-400 text-xs font-medium pb-1 group-hover:text-orange-400 transition-colors">
                    EPISODE {ep.number}
                  </span>
                  {ep.isFiller && (
                    <span className="text-[10px] uppercase font-bold text-zinc-500 w-min px-1.5 py-0.5 rounded bg-zinc-800 tracking-wider">Filler</span>
                  )}
                </div>
                <PlayCircle className="w-5 h-5 text-zinc-600 group-hover:text-orange-500 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
