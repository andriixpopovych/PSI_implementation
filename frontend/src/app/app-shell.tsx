import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';

import { TopBar } from '@/features/stay-smart/components/top-bar';
import { screenMotion } from '@/features/stay-smart/lib/motion';

export function AppShell() {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={screenMotion}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col gap-10"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
