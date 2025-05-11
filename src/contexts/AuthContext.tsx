// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient'; // დარწმუნდით, რომ გზა სწორია
import { toast } from 'sonner'; // დავამატოთ toast იმპორტი, რადგან signOut-ში ვიყენებთ

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => { // გადავარქვი ცვლადს, რომ არ აირიოს
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
    }).catch(error => {
      console.error("Error getting initial session:", error);
      setIsLoading(false); // შეცდომის შემთხვევაშიც ჩატვირთვა უნდა დასრულდეს
      toast.error("Could not verify authentication status.");
    });

    const { data: authStateListenerData } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => { // გადავარქვი ცვლადს
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false); // მნიშვნელოვანია აქაც false იყოს
      }
    );

    // useEffect-ის გასუფთავების ფუნქცია
    return () => {
      // ---> შესწორებული ხაზი <---
      authStateListenerData?.subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setIsLoading(true); 
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error signing out:", error);
        toast.error("Logout failed: " + error.message);
        setIsLoading(false); // შეცდომის შემთხვევაშიც ჩატვირთვა უნდა დასრულდეს
    }
    // სესია და მომხმარებელი ავტომატურად განახლდება onAuthStateChange listener-ით,
    // რომელიც isLoading-ს false-ზე დააყენებს.
  };

  const value = {
    session,
    user,
    isLoading,
    signOut,
  };

  // არ ვაჩვენებთ children-ს, სანამ isLoading true-ა (ანუ, სანამ საწყისი სესიის ინფორმაცია არ ჩაიტვირთება)
  // ეს ხელს უშლის "깜빡거림ას" (flickering), როდესაც გვერდი ჯერ არაავტორიზებულ მდგომარეობას აჩვენებს და მერე სწრაფად იცვლება.
  if (isLoading && !session) { // დავამატე !session, რომ თუ სესია უკვე გვაქვს, მაინც ვაჩვენოთ children
    return (
      <div className="bg-[#0a0e15] min-h-screen flex items-center justify-center">
        <p className="text-xl text-[#ffc125] font-minecraft animate-pulse">Initializing Session...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};