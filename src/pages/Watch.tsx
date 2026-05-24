import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { animeApi } from '../lib/api';
import { StreamResponse } from '../types';
import HLSPlayer from '../components/HLSPlayer';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import { ArrowLeft, Server } from 'lucide-react';

export default function Watch() {
  const { anime_id, ep_id } = useParams<{ anime_id: string; ep_id: string }>();
  
  const [streamData, setStreamData] = useState<StreamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [server, setServer] = useState('hd-1'); // Default server as per prompt

  const fetchStream = async (serverId: string) => {
    if (!anime_id || !ep_id) return;
    try {
      setLoading(true);
      setError(null);
      // Constructing episode id logic might depend on your specific REST API.
      // E.g., some APIs use ep_id directly, others require passing anime info.
      // Based on prompt: GET /api/stream?id={anime_id}&server=hd-1&type=sub
      // Wait, if it's episode id, usually that's passed. Let's pass ep_id.
      const data = await animeApi.getStreamLink(ep_id, serverId, 'sub');
      
      if (!data?.results?.streamingLink?.[0]?.link?.file) {
        throw new Error('No streaming link found for this episode.');
      }
      
      setStreamData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize stream. The server might be down.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStream(server);
  }, [anime_id, ep_id, server]);

  const handleServerChange = () => {
    // Toggle between basic servers just to show resilience logic
    const nextServer = server === 'hd-1' ? 'hd-2' : 'hd-1';
    setServer(nextServer);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link 
        to={`/anime/${anime_id}`}
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-orange-400 transition-colors mb-6 font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Anime Details
      </Link>

      <div className="bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
        {loading ? (
          <div className="aspect-video w-full flex flex-col items-center justify-center bg-black/50">
            <PageLoader />
            <span className="text-zinc-500 mt-4 text-sm animate-pulse">Connecting to stream {server}...</span>
          </div>
        ) : error ? (
          <div className="aspect-video w-full flex bg-black/50">
             <ErrorState 
              message={error} 
              onRetry={() => fetchStream(server)} 
            />
          </div>
        ) : streamData ? (
          <HLSPlayer 
            url={streamData.results.streamingLink[0].link.file} 
            tracks={streamData.tracks}
          />
        ) : null}

        <div className="p-4 sm:p-6 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Now Playing</h1>
            <p className="text-zinc-400 text-sm">Episode ID: {ep_id}</p>
          </div>
          
          <button
            onClick={handleServerChange}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors border border-zinc-700"
            title="Switch server if video fails to load"
          >
            <Server className="w-4 h-4" />
            Switch Server ({server})
          </button>
        </div>
      </div>
    </div>
  );
}
