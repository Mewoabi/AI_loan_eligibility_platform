import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { UsersProvider } from './context/usersContext'
import { ToastProvider } from './context/toastContext'
import { DataProvider, useData } from './context/DataContext'
import LoadingOverlay from './components/LoadingOverlay'
import './App.css'
import Navbar from './components/Navbar'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import QuickScore from './pages/scoring/QuickScore'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/profile/ProfilePage'
import CreateProfile from './pages/profile/CreateProfile'
import Dashboard from './pages/Dashboard'
import MyScores from './pages/scoring/MyScores'
import ScoreDetails from './pages/scoring/ScoreDetails'
import ScoreHistory from './pages/scoring/ScoreHistory'
import ScoreUser from './pages/scoring/ScoreUser'

// Protected route component to handle authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { loading: dataLoading } = useData();

  // Show loading overlay during initial data loading
  if (dataLoading.initial) {
    return <LoadingOverlay isLoading={true} message="Loading your data..." />;
  }

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <DataProvider>
            <UsersProvider>
              <Router>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
                  <Navbar />
                  <main>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/quick-score" element={<QuickScore />} />
                    
                    {/* Protected Routes */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/score-user" 
                      element={
                        <ProtectedRoute>
                          <ScoreUser />
                        </ProtectedRoute>
                        // <UsersDemo />
                      } 
                    />
                    <Route 
                      path="/my-scores" 
                      element={
                        <ProtectedRoute>
                          <MyScores />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/score-history" 
                      element={
                        <ProtectedRoute>
                          <ScoreHistory />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile/create" 
                      element={
                        <ProtectedRoute>
                          <CreateProfile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/scores/:id" 
                      element={
                        <ProtectedRoute>
                          <ScoreDetails />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Fallback Route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </Router>
            </UsersProvider>
          </DataProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
