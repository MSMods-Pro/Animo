import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="w-full min-h-[50vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  );
}
