import type { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import HomePage from '@/pages/Home/HomePage';

const App: FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
