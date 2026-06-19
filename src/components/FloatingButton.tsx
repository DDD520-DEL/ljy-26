import { useState } from 'react';
import { Droplets } from 'lucide-react';
import AddRecordModal from './AddRecordModal';

export default function FloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-30 w-16 h-16 md:w-20 md:h-20 rounded-full bg-water-gradient text-white shadow-water hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center group"
      >
        <div className="absolute inset-0 rounded-full border-4 border-water-300/50 animate-ripple" />
        <div className="absolute inset-0 rounded-full border-4 border-water-300/30 animate-ripple delay-300" />
        <div className="relative z-10 flex flex-col items-center">
          <Droplets className="w-7 h-7 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] md:text-xs font-display mt-0.5 hidden sm:block">我换水了</span>
        </div>
      </button>

      <AddRecordModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
