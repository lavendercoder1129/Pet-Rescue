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
import DonatePage from './pages/DonatePage';
import DonationReceiptPage from './pages/donor/DonationReceiptPage';
import DonorDonationsPage from './pages/donor/DonorDonationsPage';
import AdminDonationsPage from './pages/admin/AdminDonationsPage';
import AdminFundsPage from './pages/admin/AdminFundsPage';

// Dashboards
import DonorDashboard from './pages/dashboards/DonorDashboard';
import RescuerDashboard from './pages/dashboards/RescuerDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';

// Rescuer Case Management Pages
import MyCasesPage from './pages/rescuer/MyCasesPage';
import NewCasePage from './pages/rescuer/NewCasePage';

// Admin Case Verification Pages
import AdminCasesPage from './pages/admin/AdminCasesPage';
import AdminCaseReviewPage from './pages/admin/AdminCaseReviewPage';

// Rescuer & Admin Expense Pages (Module 8)
import NewExpensePage from './pages/rescuer/NewExpensePage';
import RescuerExpensesPage from './pages/rescuer/RescuerExpensesPage';
import AdminExpensesPage from './pages/admin/AdminExpensesPage';
import AdminExpenseReviewPage from './pages/admin/AdminExpenseReviewPage';

// Route Protection
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

            {/* Donation Workflow Routes */}
            <Route path="donate/:caseId" element={<DonatePage />} />
            <Route
              path="donation/success/:donationId"
              element={
                <ProtectedRoute>
                  <DonationReceiptPage />
                </ProtectedRoute>
              }
            />

            {/* Donor Donation History */}
            <Route
              path="donor/donations"
              element={
                <ProtectedRoute>
                  <DonorDonationsPage />
                </ProtectedRoute>
              }
            />

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

            {/* Rescuer Case Management Routes */}
            <Route
              path="rescuer/cases"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['rescuer', 'admin']}>
                    <MyCasesPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="rescuer/cases/new"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['rescuer', 'admin']}>
                    <NewCasePage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Rescuer Expense Tracking Routes (Module 8) */}
            <Route
              path="rescuer/expenses"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['rescuer', 'admin']}>
                    <RescuerExpensesPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="rescuer/expenses/new"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['rescuer', 'admin']}>
                    <NewExpensePage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Admin Case Verification Routes */}
            <Route
              path="admin/cases"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminCasesPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="admin/cases/:id"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminCaseReviewPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Admin Donations Overview */}
            <Route
              path="admin/donations"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminDonationsPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Admin Fund Allocation Dashboard */}
            <Route
              path="admin/funds"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminFundsPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Admin Expense Verification Routes (Module 8) */}
            <Route
              path="admin/expenses"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminExpensesPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="admin/expenses/:id"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminExpenseReviewPage />
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
