import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-6 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <div className="max-w-md">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">Oops!</h2>
        <p className="text-zinc-400 text-sm mb-6">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-full font-medium transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
