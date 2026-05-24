import React, { useState, useCallback, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Play, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setIsMobileMenuOpen(false);
    }
  }, [query, navigate]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#1e1e24]/95 backdrop-blur-md shadow-sm border-b border-white/5">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-6">
        
        <div className="flex items-center gap-8">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-[#fca311] flex items-center justify-center">
              <Play className="w-5 h-5 text-zinc-900 ml-0.5" fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white hidden sm:block">
              ANIKO<span className="text-[#fca311]">TO</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 font-medium text-sm">
            <Link to="/" className="text-[#fca311] hover:text-[#fca311] transition-colors">Home</Link>
            <Link to="/search" className="text-zinc-300 hover:text-white transition-colors">Movies</Link>
            <Link to="/search" className="text-zinc-300 hover:text-white transition-colors">TV Series</Link>
            <Link to="/search" className="text-zinc-300 hover:text-white transition-colors">Most Popular</Link>
            <Link to="/search" className="text-zinc-300 hover:text-white transition-colors">Top Airing</Link>
          </div>
        </div>

        {/* Global Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm relative hidden sm:block">
          <div className="relative group flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime..."
              className={cn(
                "w-full h-10 pl-4 pr-10 rounded bg-[#2a2a32] border-none",
                "focus:outline-none focus:ring-1 focus:ring-[#fca311]",
                "transition-all text-sm text-zinc-100 placeholder:text-zinc-500"
              )}
            />
            <button type="submit" className="absolute right-3 text-zinc-400 hover:text-[#fca311] transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-4">
          <button className="hidden lg:block px-5 py-2 bg-[#fca311] hover:bg-[#e6940f] text-zinc-950 font-bold text-sm rounded transition-colors">
            Login
          </button>
          
          <button 
            className="md:hidden text-zinc-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#1e1e24] border-b border-white/5 p-4 flex flex-col gap-4 shadow-xl">
          <form onSubmit={handleSearch} className="relative group w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime..."
              className="w-full h-12 pl-4 pr-12 rounded bg-[#2a2a32] border-none text-white focus:outline-none focus:ring-1 focus:ring-[#fca311]"
            />
            <button type="submit" className="absolute right-4 top-4 text-zinc-400 hover:text-[#fca311] transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>
          
          <div className="flex flex-col gap-3 mt-2 font-medium">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-[#fca311] py-2">Home</Link>
            <Link to="/search" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-300 hover:text-white py-2">Movies</Link>
            <Link to="/search" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-300 hover:text-white py-2">TV Series</Link>
            <Link to="/search" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-300 hover:text-white py-2">Most Popular</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
