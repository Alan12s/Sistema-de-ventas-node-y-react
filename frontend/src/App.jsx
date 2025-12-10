// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import ProductsIndex from './pages/products/ProductsIndex';
import ProductCreate from './pages/products/ProductCreate';
import ProductEdit from './pages/products/ProductEdit';
import ProductShow from './pages/products/ProductShow';
import CategoriesIndex from './pages/categories/CategoriesIndex';
import SalesIndex from './pages/sales/SalesIndex';
import UsersIndex from './pages/users/UsersIndex';
import POS from './pages/pos/POS';
import Profile from './pages/profile/Profile';
import PermissionsIndex from './pages/permissions/PermissionsIndex';
import ReportsIndex from './pages/reports/ReportsIndex';

// Ruta protegida
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  console.log('🔐 ProtectedRoute:', { isAuthenticated, user, allowedRoles });

  if (!isAuthenticated) {
    console.log('❌ No autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.log('❌ Sin permisos, redirigiendo a /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ Acceso permitido');
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* 🔓 Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* 🔒 Rutas protegidas - TODOS los usuarios autenticados */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/pos" 
          element={
            <ProtectedRoute>
              <POS />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <ProductsIndex />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/products/show/:id" 
          element={
            <ProtectedRoute>
              <ProductShow />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/categories" 
          element={
            <ProtectedRoute>
              <CategoriesIndex />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/sales" 
          element={
            <ProtectedRoute>
              <SalesIndex />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <ReportsIndex />
            </ProtectedRoute>
          } 
        />

        {/* 🔒 Rutas solo ADMIN */}
        <Route 
          path="/products/create" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProductCreate />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/products/edit/:id" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProductEdit />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UsersIndex />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/permissions" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PermissionsIndex />
            </ProtectedRoute>
          } 
        />

        {/* 🏠 Redirecciones */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;