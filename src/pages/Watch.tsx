import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { animeApi } from '../lib/api';
import { StreamResponse, Episode } from '../types';
import HLSPlayer from '../components/HLSPlayer';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import { ArrowLeft, Play, PlayCircle, SkipBack, SkipForward, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Watch() {
  const { anime_id, ep_id } = useParams<{ anime_id: string; ep_id: string }>();
  const navigate = useNavigate();
  
  const [streamData, setStreamData] = useState<StreamResponse | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [server, setServer] = useState('hd-1'); 
  const [serverType, setServerType] = useState<'sub' | 'dub'>('sub');
  const [episodeSearch, setEpisodeSearch] = useState('');

  const fetchStream = async (serverId: string, type: string) => {
    if (!anime_id || !ep_id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await animeApi.getStreamLink(anime_id, ep_id, serverId, type);
      
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

  const fetchEpisodes = async () => {
    if (!anime_id) return;
    try {
      const eps = await animeApi.getEpisodes(anime_id);
      setEpisodes(eps);
    } catch (err) {
      console.error('Failed to load episodes', err);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, [anime_id]);

  useEffect(() => {
    fetchStream(server, serverType);
  }, [anime_id, ep_id, server, serverType]);

  const readableEp = ep_id?.replace(/-/g, ' ').toUpperCase() || '';
  const currentEpisode = episodes.find(e => String(e.id) === String(ep_id));

  // Combine episodes into seasons/chunks
  const CHUNK_SIZE = 50;
  const seasons = Math.ceil(episodes.length / CHUNK_SIZE);
  const [selectedSeason, setSelectedSeason] = useState(0);

  // Auto-select season based on current episode
  useEffect(() => {
    if (episodes.length > 0 && currentEpisode) {
      const idx = episodes.findIndex(e => String(e.id) === String(ep_id));
      if (idx !== -1) {
        setSelectedSeason(Math.floor(idx / CHUNK_SIZE));
      }
    }
  }, [episodes, ep_id]);

  const displayedEpisodes = episodeSearch 
    ? episodes.filter(e => 
        e.title?.toLowerCase().includes(episodeSearch.toLowerCase()) || 
        String(e.number).includes(episodeSearch)
      )
    : episodes.slice(selectedSeason * CHUNK_SIZE, (selectedSeason + 1) * CHUNK_SIZE);

  const currentIndex = episodes.findIndex(e => String(e.id) === String(ep_id));
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex !== -1 && currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8">
      <Link 
        to={`/anime/${anime_id}`}
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#fca311] transition-colors mb-6 font-bold text-sm tracking-wide uppercase"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Details
      </Link>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="bg-[#0a0a0c] overflow-hidden border border-white/10 shadow-2xl rounded-t-lg xl:rounded-lg">
            {loading ? (
              <div className="aspect-video w-full flex flex-col items-center justify-center bg-black">
                <PageLoader />
                <span className="text-zinc-500 mt-4 text-sm animate-pulse tracking-widest uppercase font-bold">Connecting...</span>
              </div>
            ) : error ? (
              <div className="aspect-video w-full flex bg-black">
                 <ErrorState 
                  message={error} 
                  onRetry={() => fetchStream(server, serverType)} 
                />
              </div>
            ) : streamData ? (
              <HLSPlayer 
                url={streamData.results.streamingLink[0].link.file} 
                tracks={streamData.tracks}
                referer={streamData.referer}
                intro={streamData.intro}
                outro={streamData.outro}
                animeId={anime_id}
                epId={ep_id}
              />
            ) : null}

            <div className="p-4 sm:p-5 bg-[#1e1e24] border-t border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between w-full">
                {/* Left Side: Prev Button */}
                <div className="flex-shrink-0 w-20 sm:w-24">
                  {prevEpisode ? (
                    <Link 
                      to={`/watch/${anime_id}/${prevEpisode.id}`}
                      className="flex gap-1.5 items-center justify-center text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-[#fca311] transition-colors bg-[#2a2a32] hover:bg-[#32323b] px-3 py-2 rounded border border-white/5 w-full"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Prev</span>
                    </Link>
                  ) : null}
                </div>
                
                {/* Center: Title info */}
                <div className="text-center flex-1 px-4 min-w-0">
                  <h1 className="text-sm font-bold text-white uppercase tracking-wider truncate">
                    {currentEpisode?.title || readableEp}
                  </h1>
                  <p className="text-zinc-400 text-[11px] mt-1 font-bold tracking-wider">
                    EPISODE {currentEpisode?.number || ''}
                  </p>
                </div>

                {/* Right Side: Next Button */}
                <div className="flex-shrink-0 w-20 sm:w-24">
                  {nextEpisode ? (
                    <Link 
                      to={`/watch/${anime_id}/${nextEpisode.id}`}
                      className="flex gap-1.5 items-center justify-center text-xs font-bold uppercase tracking-wider text-[#1e1e24] bg-[#fca311] hover:bg-[#e6940f] transition-colors px-3 py-2 rounded shadow-[0_0_10px_rgba(252,163,17,0.2)] w-full"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <SkipForward className="w-3.5 h-3.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
              
              {/* Settings inline */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 w-full">
                {/* Audio Type */}
                <div className="flex bg-[#0a0a0c] p-0.5 rounded border border-white/5">
                  <button
                    onClick={() => setServerType('sub')}
                    className={cn(
                      "px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded transition-all",
                      serverType === 'sub' ? "bg-[#fca311] text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    Sub
                  </button>
                  <button
                    onClick={() => setServerType('dub')}
                    className={cn(
                      "px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded transition-all",
                      serverType === 'dub' ? "bg-[#fca311] text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    Dub
                  </button>
                </div>
                
                {/* Server */}
                <div className="flex bg-[#0a0a0c] p-0.5 rounded border border-white/5">
                   {['hd-1', 'hd-2'].map((srv) => (
                      <button
                        key={srv}
                        onClick={() => setServer(srv)}
                        className={cn(
                          "px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded transition-all",
                          server === srv ? "bg-[#2a2a32] text-[#fca311] shadow-sm border border-white/5" : "text-zinc-400 hover:text-white border border-transparent"
                        )}
                      >
                        {srv.toUpperCase()}
                      </button>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>

         {/* Sidebar Episodes List */}
        <div className="w-full xl:w-80 flex-shrink-0 flex flex-col gap-4">
           <div className="bg-[#1e1e24] border border-white/5 p-4 rounded-lg shadow-xl h-full flex flex-col max-h-[800px] xl:max-h-none overflow-hidden">
             <div className="flex flex-col gap-3 border-b border-white/10 pb-4 mb-4 shrink-0">
               <div className="flex items-center gap-2">
                 <Play className="w-5 h-5 text-[#fca311]" fill="currentColor" />
                 <h2 className="text-lg font-black text-white uppercase tracking-wider">Episodes</h2>
                 <span className="ml-auto bg-[#32323b] text-zinc-400 px-2 py-0.5 rounded text-xs font-bold">{episodes.length}</span>
               </div>
               
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                 <input
                   type="text"
                   placeholder="Search episode..."
                   value={episodeSearch}
                   onChange={(e) => setEpisodeSearch(e.target.value)}
                   className="w-full bg-[#0a0a0c] text-white text-sm px-9 py-2 rounded focus:outline-none focus:border-[#fca311] focus:ring-1 focus:ring-[#fca311] border border-white/5 transition-all outline-none placeholder:text-zinc-600 font-medium"
                 />
               </div>
               
               {seasons > 1 && !episodeSearch && (
                 <select
                   value={selectedSeason}
                   onChange={(e) => setSelectedSeason(Number(e.target.value))}
                   className="w-full bg-[#2a2a32] text-white text-xs font-bold uppercase tracking-wider px-3 py-2 rounded focus:outline-none focus:border-[#fca311]"
                 >
                   {Array.from({ length: seasons }).map((_, i) => {
                     const start = i * CHUNK_SIZE + 1;
                     const end = Math.min((i + 1) * CHUNK_SIZE, episodes.length);
                     return (
                       <option key={i} value={i}>
                         EP {start} - {end}
                       </option>
                     );
                   })}
                 </select>
               )}
             </div>
             
             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
               {episodes.length === 0 ? (
                 <div className="text-center text-zinc-500 py-8 text-sm font-medium">Looking for episodes...</div>
               ) : (
                 displayedEpisodes.map((ep) => {
                   const isActive = String(ep.id) === String(ep_id);
                   return (
                     <Link
                       key={ep.id}
                       to={`/watch/${anime_id}/${ep.id}`}
                       className={cn(
                         "flex items-center gap-3 p-3 rounded border transition-all duration-200 group text-left",
                         isActive 
                           ? "bg-[#fca311]/10 border-[#fca311]/50 text-[#fca311]" 
                           : "bg-[#2a2a32] border-transparent hover:border-white/20 text-zinc-300 hover:bg-[#32323b]"
                       )}
                     >
                       <div className="shrink-0">
                          {isActive ? (
                            <Play className="w-5 h-5" fill="currentColor" />
                          ) : (
                            <PlayCircle className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                          )}
                       </div>
                       <div className="min-w-0 flex-1">
                          <div className={cn(
                            "text-sm font-bold truncate transition-colors",
                            isActive ? "text-[#fca311]" : "group-hover:text-white"
                          )}>
                             EP {ep.number}
                          </div>
                          {ep.title && ep.title !== `Episode ${ep.number}` && (
                            <div className={cn(
                              "text-xs truncate transition-colors",
                              isActive ? "text-[#fca311]/80" : "text-zinc-500 group-hover:text-zinc-400"
                            )}>
                              {ep.title}
                            </div>
                          )}
                       </div>
                       {ep.isFiller && (
                         <span className={cn(
                           "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider shrink-0",
                           isActive ? "bg-[#fca311]/20 text-[#fca311]" : "bg-black text-zinc-500"
                         )}>
                           Filler
                         </span>
                       )}
                     </Link>
                   )
                 })
               )}
             </div>
           </div>
        </div>
      </div>
      
      {/* Add custom scrollbar styling globally or inline for the episode list */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(252, 163, 17, 0.5); }
      `}</style>
    </div>
  );
}
