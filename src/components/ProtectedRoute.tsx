// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = () => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="bg-[#0a0e15] min-h-screen flex items-center justify-center">
        <p className="text-xl text-[#ffc125] font-minecraft animate-pulse">Authenticating...</p>
      </div>
    );
  }

  if (!session?.user) {
    // მომხმარებელი არ არის ავტორიზებული, გადავამისამართოთ login გვერდზე
    // state-ში ვინახავთ წინა მდებარეობას, რათა შესვლის შემდეგ იქ დავაბრუნოთ
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // მომხმარებელი ავტორიზებულია, ვაჩვენებთ შვილობილ მარშრუტს (მაგ., AdminPanel)
  return <Outlet />; 
};

export default ProtectedRoute;