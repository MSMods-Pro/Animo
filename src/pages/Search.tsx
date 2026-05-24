import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { animeApi } from '../lib/api';
import { Anime } from '../types';
import AnimeCard from '../components/AnimeCard';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery) return;
    try {
      setLoading(true);
      setError(null);
      const data = await animeApi.searchAnime(searchQuery);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search anime');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(query);
  }, [query]);

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-zinc-500">
        <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Type something to start searching</p>
      </div>
    );
  }

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={() => fetchResults(query)} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          Search Results for <span className="text-orange-500">"{query}"</span>
        </h1>
        <p className="text-zinc-400 mt-1">Found {results.length} results</p>
      </div>
      
      {results.length === 0 ? (
        <div className="text-center text-zinc-500 py-12">No anime found matching your criteria.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {results.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}
    </div>
  );
}
