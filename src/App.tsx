import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Toaster } from 'react-hot-toast'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Import student pages
import Dashboard from './pages/student/Dashboard'
import Drives from './pages/student/Drives'
import DriveDetails from './pages/student/DriveDetails'
import MyApplications from './pages/student/MyApplications'
import Companies from './pages/student/Companies'
import Stats from './pages/student/Stats'
import Profile from './pages/student/Profile'

// Import auth pages
import Login from './pages/Login'
import Signup from './pages/Signup'

// Import admin pages
import ManageDrives from './pages/admin/ManageDrives'
import ReviewApplications from './pages/admin/ReviewApplications'
import ManageStudents from './pages/admin/ManageStudents'
import ManageCompanies from './pages/admin/ManageCompanies'

// App component
function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb'
          }
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes with layout */}
        <Route element={<Layout />}>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Student routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/drives" element={
            <ProtectedRoute>
              <Drives />
            </ProtectedRoute>
          } />
          <Route path="/drives/:id" element={
            <ProtectedRoute>
              <DriveDetails />
            </ProtectedRoute>
          } />
          <Route path="/my-applications" element={
            <ProtectedRoute>
              <MyApplications />
            </ProtectedRoute>
          } />
          <Route path="/companies" element={
            <ProtectedRoute>
              <Companies />
            </ProtectedRoute>
          } />
          <Route path="/stats" element={
            <ProtectedRoute>
              <Stats />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/drives" element={
            <ProtectedRoute allowedRoles={['admin', 'coordinator']}>
              <ManageDrives />
            </ProtectedRoute>
          } />
          <Route path="/admin/applications" element={
            <ProtectedRoute allowedRoles={['admin', 'coordinator']}>
              <ReviewApplications />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageStudents />
            </ProtectedRoute>
          } />
          <Route path="/admin/companies" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageCompanies />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  )
}

export default App