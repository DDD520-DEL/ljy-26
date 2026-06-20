import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Ranking from '@/pages/Ranking';
import HallOfFame from '@/pages/HallOfFame';
import HeroProfile from '@/pages/HeroProfile';
import { useAppStore } from '@/store';

export default function App() {
  const initialize = useAppStore(s => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/hall-of-fame" element={<HallOfFame />} />
          <Route path="/hero/:employeeId" element={<HeroProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}
