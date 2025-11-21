// frontend/src/components/layout/MainLayout.jsx
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Contenido principal */}
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;