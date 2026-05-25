import { useState, useEffect } from 'react';

export interface ContinueWatchingItem {
  animeId: string;
  epId: string;
  title: string;
  image: string;
  epTitle: string;
  epNumber: number;
  time: number;
  timestamp: number;
}

export function useContinueWatching() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('continue_watching');
    if (data) {
      try {
        setItems(JSON.parse(data));
      } catch (e) {}
    }
  }, []);

  const updateProgress = (item: ContinueWatchingItem) => {
    setItems(prev => {
      let newData = prev.filter(i => i.animeId !== item.animeId);
      newData.unshift(item);
      // Keep only top 20
      newData = newData.slice(0, 20);
      localStorage.setItem('continue_watching', JSON.stringify(newData));
      return newData;
    });
  };

  const removeItem = (animeId: string) => {
    setItems(prev => {
      const newData = prev.filter(i => i.animeId !== animeId);
      localStorage.setItem('continue_watching', JSON.stringify(newData));
      return newData;
    });
  };

  return { items, updateProgress, removeItem };
}
