import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { LandingPage } from '@/pages/Landing'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Patients from '@/pages/dashboard/Patients'
import DashboardHome from '@/pages/dashboard/Home'
import { AuthProvider } from '@/contexts/AuthContext'
import { PermissionProvider } from '@/contexts/PermissionContext'
import { Toaster } from "@/components/ui/sonner"
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'

import Appointments from '@/pages/dashboard/Appointments'
import Team from '@/pages/dashboard/Team'
import Logs from '@/pages/dashboard/Logs'
import MasterDashboard from '@/pages/dashboard/MasterDashboard'
import Permissions from '@/pages/dashboard/Permissions'

export default function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <BrowserRouter>
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
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </PermissionProvider>
    </AuthProvider>
  )
}
