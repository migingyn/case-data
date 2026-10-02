import type { FC } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import AppShell from '@/components/AppShell/AppShell';
import ComingSoonPage from '@/pages/ComingSoon/ComingSoonPage';
import HomePage from '@/pages/Home/HomePage';
import MatterPage from '@/pages/Matter/MatterPage';

const App: FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/app" element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="matters/:id" element={<MatterPage />} />
        <Route path="matters/:id/share" element={<ComingSoonPage title="Share with provider" />} />
        <Route path="matters/:id/record" element={<ComingSoonPage title="Full record" />} />
        <Route path="matters/:id/facts" element={<ComingSoonPage title="Review facts" />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
