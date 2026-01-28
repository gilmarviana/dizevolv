import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { LandingPage } from '@/pages/Landing'
import { AuthProvider } from '@/contexts/AuthContext'
import { PermissionProvider } from '@/contexts/PermissionContext'
import { Toaster } from "@/components/ui/sonner"
import { Loader2 } from 'lucide-react'

// Auth Pages
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'))

// Dashboard Pages
const DashboardHome = lazy(() => import('@/pages/dashboard/Home'))
const Patients = lazy(() => import('@/pages/dashboard/Patients'))
const Appointments = lazy(() => import('@/pages/dashboard/Appointments'))
const Team = lazy(() => import('@/pages/dashboard/Team'))
const Logs = lazy(() => import('@/pages/dashboard/Logs'))
const MasterDashboard = lazy(() => import('@/pages/dashboard/MasterDashboard'))
const Permissions = lazy(() => import('@/pages/dashboard/Permissions'))
const Documents = lazy(() => import('@/pages/dashboard/Documents'))
const Billing = lazy(() => import('@/pages/dashboard/Billing'))

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

export default function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Protected Routes (App) */}
              <Route path="/dashboard" element={<AppLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="patients" element={<Patients />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="team" element={<Team />} />
                <Route path="logs" element={<Logs />} />
                <Route path="master" element={<MasterDashboard />} />
                <Route path="permissions" element={<Permissions />} />
                <Route path="documents" element={<Documents />} />
                <Route path="billing" element={<Billing />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="top-right" />
      </PermissionProvider>
    </AuthProvider>
  )
}

