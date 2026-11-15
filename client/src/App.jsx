import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import HowItWorksPage from './pages/HowItWorksPage';
import TransparencyPage from './pages/TransparencyPage';
import DonorWallPage from './pages/DonorWallPage';
import DesignSystemPage from './pages/DesignSystemPage';
import NotFoundPage from './pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="cases/:id" element={<CaseDetailPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="transparency" element={<TransparencyPage />} />
          <Route path="donor-wall" element={<DonorWallPage />} />
          <Route path="design-system" element={<DesignSystemPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
