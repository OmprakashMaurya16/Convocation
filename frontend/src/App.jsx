import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import StaffScanner from './pages/StaffScanner';
import InvalidStageError from './pages/InvalidStageError';
import StudentDashboard from './pages/StudentDashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminDashboard />,
  },
  {
    path: '/staff-scanner',
    element: <StaffScanner />,
  },
  {
    path: '/invalid-stage',
    element: <InvalidStageError />,
  },
  {
    path: '/student-dashboard',
    element: <StudentDashboard />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
