import type { FC } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import AppShell from '@/components/AppShell/AppShell';
import HomePage from '@/pages/Home/HomePage';
import MatterPage from '@/pages/Matter/MatterPage';

const App: FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/app" element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="matters/:id" element={<MatterPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
