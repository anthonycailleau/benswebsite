import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // ou sessionStorage
  return token ? children : <Navigate to="/admin/" replace />;
};

export default PrivateRoute;