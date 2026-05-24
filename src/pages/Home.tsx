import { useEffect, useState } from 'react';
import { animeApi } from '../lib/api';
import { Anime } from '../types';
import AnimeCard from '../components/AnimeCard';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import { Flame } from 'lucide-react';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Flame className="w-6 h-6 text-orange-500" />
        <h1 className="text-2xl font-bold text-zinc-100">Latest Episodes</h1>
      </div>
      
      {episodes.length === 0 ? (
        <div className="text-center text-zinc-500 py-12">No episodes found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {episodes.map((anime) => (
            <AnimeCard key={`${anime.id}-${anime.episodeNumber}`} anime={anime} />
          ))}
        </div>
      )}
    </div>
  );
}
