// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { session, isLoading: authLoading } = useAuth(); // ვიღებთ სესიას და ჩატვირთვის სტატუსს context-იდან
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // ფორმის გაგზავნის სტატუსი
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // თუ მომხმარებელი უკვე ავტორიზებულია და auth არ იტვირთება, გადავამისამართოთ
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
      // navigate('/admin'); // პირდაპირი გადამისამართებაც შეიძლება, მაგრამ onAuthStateChange უფრო სანდოა
    }
    setIsSubmitting(false);
  };
  
  // თუ authLoading true-ა ან session უკვე არსებობს, ვაჩვენებთ ჩატვირთვის ინდიკატორს ან არაფერს
  if (authLoading || session) {
    return (
        <div className="bg-[#0a0e15] min-h-screen flex items-center justify-center">
            <p className="text-xl text-[#ffc125] font-minecraft animate-pulse">Loading...</p>
        </div>
    );
  }

  return (
    <div className="bg-[#0a0e15] min-h-screen flex flex-col items-center justify-center p-4 text-gray-300">
      <Card className="w-full max-w-sm bg-[#1f2028] border-transparent shadow-xl dark:shadow-[0_8px_30px_rgba(255,193,37,0.08)] rounded-lg">
        <CardHeader className="text-center pt-6 pb-4">
          <RouterLink to="/" className="inline-block mb-4">
            <span className="font-minecraft text-[#ffc125] text-2xl hover:opacity-80 transition-opacity">
              MC Tier List
            </span>
          </RouterLink>
          <CardTitle className="text-xl font-semibold text-gray-100">Admin Login</CardTitle>
          <CardDescription className="text-gray-400 text-sm pt-1">
            Enter your credentials to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-gray-400">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#0a0e15] border-[#2d3748] text-gray-200 focus:ring-1 focus:ring-[#ffc125] focus:border-[#ffc125] placeholder-gray-500"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-gray-400">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#0a0e15] border-[#2d3748] text-gray-200 focus:ring-1 focus:ring-[#ffc125] focus:border-[#ffc125] placeholder-gray-500"
              />
            </div>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <Button 
              type="submit" 
              className="w-full bg-[#ffc125] text-[#0a0e15] font-semibold hover:bg-[#ffc125]/90 focus:ring-2 focus:ring-[#ffc125]/50 focus:ring-offset-2 focus:ring-offset-[#1f2028] py-2.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : <><LogIn className="mr-2 h-4 w-4" /> Login</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;