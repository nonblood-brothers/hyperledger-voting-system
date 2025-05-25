import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import KycPending from './pages/KycPending';
import KycRejected from './pages/KycRejected';
import KycReview from './pages/admin/KycReview';
import PollReview from './pages/admin/PollReview';
import PollList from './pages/PollList';
import CreatePoll from './pages/CreatePoll';
import PollDetail from './pages/PollDetail';
import PollOptions from './pages/PollOptions';
import 'bootstrap/dist/css/bootstrap.min.css';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <Container>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* KYC status routes */}
            <Route element={<ProtectedRoute requireAuth={true} />}>
              <Route path="/kyc-pending" element={<KycPending />} />
              <Route path="/kyc-rejected" element={<KycRejected />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute requireAuth={true} requireAdmin={true} />}>
              <Route path="/admin/kyc-review" element={<KycReview />} />
              <Route path="/admin/poll-review" element={<PollReview />} />
              {/* Add more admin routes here */}
            </Route>

            {/* Poll viewing routes (accessible to all users) */}
            <Route path="/polls" element={<PollList />} />
            <Route path="/polls/:id" element={<PollDetail />} />

            {/* Student routes (require KYC verification) */}
            <Route element={<ProtectedRoute requireAuth={true} requireKyc={true} />}>
              {/* Add more student routes here */}
            </Route>

            {/* Student-only routes (not accessible to admins) */}
            <Route element={<ProtectedRoute requireAuth={true} requireKyc={true} requireStudent={true} />}>
              <Route path="/polls/create" element={<CreatePoll />} />
              <Route path="/polls/:id/edit" element={<CreatePoll isEditMode={true} />} />
              <Route path="/polls/:id/options" element={<PollOptions />} />
            </Route>

            {/* Default route */}
            <Route path="/" element={<Navigate to="/polls" replace />} />
            <Route path="*" element={<Navigate to="/polls" replace />} />
          </Routes>
        </Container>
      </AuthProvider>
    </Router>
  );
};

export default App;
