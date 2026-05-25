import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json());

  // --- MOCK NODE.JS REST API ---
  // The user requested hitting these endpoints. For preview purposes, we provide mock data.
  // In production, the user would replace this backend with their real database or API.

  const mockAnime = [
    { id: '1', title: 'Attack on Titan: The Final Season', image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx104578-laZZ22B8JbK9.jpg', type: 'TV', episodeNumber: 87 },
    { id: '2', title: 'Jujutsu Kaisen Season 2', image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx145064-1uM0U9D1C3nF.png', type: 'TV', episodeNumber: 23 },
    { id: '3', title: 'Demon Slayer: Hashira Training Arc', image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx166873-1pXQe4I2fT0H.jpg', type: 'TV', episodeNumber: 1 },
    { id: '4', title: 'Solo Leveling', image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-m1gX3iqITqkH.png', type: 'TV', episodeNumber: 12 },
    { id: '5', title: 'Frieren: Beyond Journey\'s End', image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-n1M2O1hC8gJ5.jpg', type: 'TV', episodeNumber: 28 },
    { id: '6', title: 'Bleach: Thousand-Year Blood War', image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx146065-u3l63c4CgB17.jpg', type: 'TV', episodeNumber: 13 },
  ];

  app.get('/api/latest-episodes', (req, res) => {
    res.json({ success: true, results: mockAnime });
  });

  app.get('/api/search', (req, res) => {
    const keyword = (req.query.keyword as string || '').toLowerCase();
    const results = mockAnime.filter(a => a.title.toLowerCase().includes(keyword));
    res.json({ success: true, results });
  });

  app.get('/api/info', (req, res) => {
    const id = req.query.id as string;
    const baseAnime = mockAnime.find(a => a.id === id) || mockAnime[0];
    res.json({
      success: true,
      data: {
        id: baseAnime.id,
        title: baseAnime.title,
        image: baseAnime.image,
        description: 'This is a mock description generated for the AI Studio preview. It contains the synopsis of the anime. The heroes face incredible odds, power up, and fight for the future of their world.',
        genres: ['Action', 'Fantasy', 'Drama'],
        status: 'Ongoing',
        totalEpisodes: 24,
        releaseDate: '2023',
      }
    });
  });

  app.get('/api/episodes/:id', (req, res) => {
    // Generate some mock episodes
    const eps = Array.from({ length: 12 }).map((_, i) => ({
      id: `ep-${i + 1}`,
      number: i + 1,
      title: `Episode ${i + 1}`,
      isFiller: i === 4
    }));
    res.json({ success: true, episodes: eps });
  });

  app.get('/api/stream', (req, res) => {
    // We return a real example HLS stream like Big Buck Bunny just to demonstrate HLS working.
    // We also provide a mock subtitle track.
    res.json({
      success: true,
      data: {
        results: {
          streamingLink: [
            {
              link: {
                // Using a known public HLS test stream
                file: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
              }
            }
          ]
        },
        tracks: [
          {
            file: 'https://raw.githubusercontent.com/andreyvit/subtitle-tools/master/sample.srt',
            label: 'English',
            kind: 'captions',
            default: true
          }
        ]
      }
    });
  });

  // --- M3U8 STREAM PROXY ---
  app.get('/api/m3u8-proxy', async (req, res) => {
    try {
      const url = req.query.url as string;
      const referer = req.query.referer as string || '';
      
      if (!url) {
        res.status(400).send('No url provided');
        return;
      }
      
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };
      if (referer) {
        headers['Referer'] = referer;
        headers['Origin'] = new URL(referer).origin;
      }

      const resp = await fetch(url, { headers });
      if (!resp.ok) {
        res.status(resp.status).send(`Failed to fetch upstream: ${resp.statusText}`);
        return;
      }

      const contentType = resp.headers.get('content-type') || 'application/vnd.apple.mpegurl';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (contentType.includes('mpegurl') || url.includes('.m3u8')) {
        const text = await resp.text();
        const rewritten = text.split('\n').map(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const absoluteUrl = trimmed.startsWith('http') ? trimmed : new URL(trimmed, url).toString();
            return `/api/m3u8-proxy?url=${encodeURIComponent(absoluteUrl)}&referer=${encodeURIComponent(referer)}`;
          }
          if (trimmed.includes('URI="')) {
            return line.replace(/URI="(.*?)"/g, (match, p1) => {
              const absoluteUrl = p1.startsWith('http') ? p1 : new URL(p1, url).toString();
              return `URI="/api/m3u8-proxy?url=${encodeURIComponent(absoluteUrl)}&referer=${encodeURIComponent(referer)}"`;
            });
          }
          return line;
        }).join('\n');
        res.send(rewritten);
      } else {
        // It's a binary file like .ts chunk
        const arrayBuffer = await resp.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
      }
    } catch (error) {
      console.error('Proxy Error:', error);
      res.status(500).send('Proxy Error');
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

// Start the server if we're not running in a serverless environment like Vercel
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer().then(app => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

// Export the app for Vercel serverless environment
export default startServer;
