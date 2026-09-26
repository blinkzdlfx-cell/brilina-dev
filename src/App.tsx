import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/public/Layout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import LoadingSpinner from './components/public/LoadingSpinner';

const Home = lazy(() => import('./pages/public/Home'));
const Projects = lazy(() => import('./pages/public/Projects'));
const ProjectDetail = lazy(() => import('./pages/public/ProjectDetail'));
const Method = lazy(() => import('./pages/public/Method'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProjects = lazy(() => import('./pages/admin/Projects'));
const AdminProjectForm = lazy(() => import('./pages/admin/ProjectForm'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));
const AdminPhotos = lazy(() => import('./pages/admin/Photos'));
const AdminCapabilities = lazy(() => import('./pages/admin/Capabilities'));
const AdminLinks = lazy(() => import('./pages/admin/Links'));
const AdminAccount = lazy(() => import('./pages/admin/Account'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:slug" element={<ProjectDetail />} />
            <Route path="method" element={<Method />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/new" element={<AdminProjectForm />} />
            <Route path="projects/:id/edit" element={<AdminProjectForm />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="photos" element={<AdminPhotos />} />
            <Route path="capabilities" element={<AdminCapabilities />} />
            <Route path="links" element={<AdminLinks />} />
            <Route path="account" element={<AdminAccount />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
