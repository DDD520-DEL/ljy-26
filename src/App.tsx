import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Ranking from '@/pages/Ranking';
import HallOfFame from '@/pages/HallOfFame';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/hall-of-fame" element={<HallOfFame />} />
        </Route>
      </Routes>
    </Router>
  );
}
