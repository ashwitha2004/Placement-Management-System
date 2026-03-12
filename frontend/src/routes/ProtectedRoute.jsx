// frontend/src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';


const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }
  try {
    const userData = JSON.parse(user);
    // Support role as string or array
    if (role) {
      if (Array.isArray(role)) {
        if (!role.includes(userData.role)) {
          return <Navigate to="/" replace />;
        }
      } else {
        if (userData.role !== role) {
          return <Navigate to="/" replace />;
        }
      }
    }
    return children;
  } catch {
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
