import { useEffect } from 'react';

import { AppRouter } from '@/app/app-router';

function App() {
  useEffect(() => {
    document.title = 'Stay Smart';
  }, []);

  return <AppRouter />;
}

export default App;
