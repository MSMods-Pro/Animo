import { AlertCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  showHome?: boolean;
}

export default function ErrorState({ message = 'Something went wrong', onRetry, showHome = true }: ErrorStateProps) {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-6 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <div className="max-w-md">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">Oops!</h2>
        <p className="text-zinc-400 text-sm mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-full font-medium transition-colors"
            >
              Try Again
            </button>
          )}
          {showHome && (
            <Link 
              to="/"
              className="px-6 py-2 bg-[#fca311] hover:bg-[#e6940f] text-zinc-950 flex items-center gap-2 rounded-full font-bold transition-colors shadow-sm"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
