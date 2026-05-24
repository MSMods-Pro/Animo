import React, { useState, useCallback, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Popcorn } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  }, [query, navigate]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <Popcorn className="w-8 h-8 text-orange-500 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 hidden sm:block">
            Aniko
          </span>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <div className="relative group flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime..."
              className={cn(
                "w-full h-10 pl-10 pr-4 rounded-full bg-zinc-900 border border-zinc-800",
                "focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500",
                "transition-all text-sm text-zinc-100 placeholder:text-zinc-500"
              )}
            />
          </div>
        </form>
      </div>
    </nav>
  );
}
