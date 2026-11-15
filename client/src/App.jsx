import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import HowItWorksPage from './pages/HowItWorksPage';
import TransparencyPage from './pages/TransparencyPage';
import DonorWallPage from './pages/DonorWallPage';
import DesignSystemPage from './pages/DesignSystemPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorDashboard from './pages/dashboards/DonorDashboard';
import RescuerDashboard from './pages/dashboards/RescuerDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            {/* Public Pages */}
            <Route index element={<HomePage />} />
            <Route path="cases" element={<CasesPage />} />
            <Route path="cases/:id" element={<CaseDetailPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="transparency" element={<TransparencyPage />} />
            <Route path="donor-wall" element={<DonorWallPage />} />
            <Route path="design-system" element={<DesignSystemPage />} />

            {/* Authentication Pages */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Protected Role-Based Dashboards */}
            <Route
              path="donor/dashboard"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['donor', 'admin']}>
                    <DonorDashboard />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="rescuer/dashboard"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['rescuer', 'admin']}>
                    <RescuerDashboard />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* General dashboard redirect */}
            <Route
              path="dashboard"
              element={<Navigate to="/" replace />}
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
