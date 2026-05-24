/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import AnimeDetails from './pages/AnimeDetails';
import Watch from './pages/Watch';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0f0f11] text-zinc-50 font-sans selection:bg-[#fca311]/30">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/anime/:id" element={<AnimeDetails />} />
            <Route path="/watch/:anime_id/:ep_id" element={<Watch />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
