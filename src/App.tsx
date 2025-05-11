// src/App.tsx (ეს არის ის სტრუქტურა, რომელიც უნდა გქონდეთ)
import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// UI კომპონენტები
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// გვერდები
import Index from "./pages/Index"; // დარწმუნდით, რომ გზები სწორია
import NotFound from "./pages/NotFound";
import MiniGame from "./pages/MiniGame";
import Overall from "./pages/Overall";
import PlayerProfile from "./pages/PlayerProfile";
import AdminPanel from "./pages/AdminPanel";
import LoginPage from '@/pages/LoginPage'; 

// კომპონენტები
import Navbar from "./components/Navbar"; // დარწმუნდით, რომ გზები სწორია
import ProtectedRoute from '@/components/ProtectedRoute'; 

// Auth Provider
import { AuthProvider } from '@/contexts/AuthContext'; 

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ShadcnToaster />
      {/* BrowserRouter არის უმაღლეს დონეზე ერთხელ */}
      <BrowserRouter> 
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-[#0a0e15]">
            <Navbar />
            <main className="flex-grow pt-16"> {/* Navbar-ის სიმაღლის (h-16) კომპენსაცია */}
              <Routes> {/* Routes იყენებს მშობელი BrowserRouter-ის კონტექსტს */}
                <Route path="/" element={<Index />} />
                <Route path="/mini-game/:miniGameId" element={<MiniGame />} />
                <Route path="/overall" element={<Overall />} />
                <Route path="/player/:playerId" element={<PlayerProfile />} />
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/admin" element={<AdminPanel />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
          <SonnerToaster richColors position="top-right" theme="dark" /> 
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;