// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Card კომპონენტები აღარ გვჭირდება ამ დიზაინისთვის
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { session, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && session) {
      navigate('/admin', { replace: true });
    }
  }, [session, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      toast.error(`Login failed: ${signInError.message}`);
    } else {
      toast.success('Login successful! Redirecting...');
      // onAuthStateChange listener-ი განაახლებს session-ს და useEffect გადაამისამართებს
    }
    setIsSubmitting(false);
  };

  if (authLoading || session) {
    return (
      <div className="bg-[#0a0e15] min-h-screen flex flex-col items-center justify-center selection:bg-[#ffc125] selection:text-[#0a0e15]">
        <div className="w-16 h-16 border-4 border-t-4 border-t-[#ffc125] border-[#2d3748] rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-[#ffc125] font-minecraft animate-pulse">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0e15] min-h-screen flex flex-col items-center justify-center p-8 text-gray-300 selection:bg-[#ffc125] selection:text-[#0a0e15]">
      <div className="text-center mb-12 w-full max-w-md"> {/* Wrapper for branding and title */}
        <RouterLink to="/" className="inline-block mb-6">
                <h2 className="text-3xl font-light text-gray-100 tracking-tight">Admin Login</h2>
        </RouterLink>
        <p className="text-gray-400 text-sm mt-2">
          Enter your credentials to access the admin panel.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-8 w-full max-w-md">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-400 tracking-wide block text-left">Email</label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-transparent border-0 border-b-2 border-[#2d3748] text-gray-200 py-3 px-1 focus:outline-none focus:ring-0 focus:border-[#ffc125] placeholder-gray-500 transition-colors duration-300"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-400 tracking-wide block text-left">Password</label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-transparent border-0 border-b-2 border-[#2d3748] text-gray-200 py-3 px-1 focus:outline-none focus:ring-0 focus:border-[#ffc125] placeholder-gray-500 transition-colors duration-300"
          />
        </div>

        {error && (
            <p className="text-sm text-center text-[#ff5555] bg-[#ff5555]/10 py-2 px-3 rounded-md border border-[#ff5555]/30">
                {error}
            </p>
        )}
        {/* თუ გსურთ აქცენტის ფერი შეცდომისთვის: */}
        {/* {error && (
            <p className="text-sm text-center text-[#ffc125] bg-[#ffc125]/10 py-2 px-3 rounded-md border border-[#ffc125]/30">
                {error}
            </p>
        )} */}


        <Button
          type="submit"
          className="w-full bg-transparent border-2 border-[#ffc125] text-[#ffc125] font-bold hover:bg-[#ffc125] hover:text-[#0a0e15] focus:bg-[#ffc125] focus:text-[#0a0e15] focus:ring-2 focus:ring-[#ffc125]/50 focus:ring-offset-2 focus:ring-offset-[#0a0e15] py-3 text-lg tracking-wider transition-all duration-300 rounded-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : <><LogIn className="mr-2 h-5 w-5" /> Login</>}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;