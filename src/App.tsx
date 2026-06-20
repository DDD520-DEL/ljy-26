import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Ranking from '@/pages/Ranking';
import HallOfFame from '@/pages/HallOfFame';
import HeroProfile from '@/pages/HeroProfile';
import { useAppStore } from '@/store';
import { useWaterReminder } from '@/hooks/useWaterReminder';
import WaterReminderBanner from '@/components/WaterReminderBanner';
import WaterReminderModal from '@/components/WaterReminderModal';

export default function App() {
  const initialize = useAppStore(s => s.initialize);
  const { reminderConfig } = useAppStore();
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleReminderTrigger = useCallback(() => {
    setShowBanner(true);
  }, []);

  useWaterReminder(handleReminderTrigger);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleBannerClose = () => {
    setShowBanner(false);
  };

  const handleBannerAction = () => {
    setShowBanner(false);
    setShowModal(true);
  };

  return (
    <>
      <WaterReminderBanner
        isOpen={showBanner}
        onClose={handleBannerClose}
        message={reminderConfig.title || '该换水了'}
        onAction={handleBannerAction}
        actionText="立即打卡"
      />

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

      <WaterReminderModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={reminderConfig.title}
        message={reminderConfig.message}
      />
    </>
  );
}
