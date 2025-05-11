// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MINI_GAMES } from '@/utils/types';
import { Menu, X, LogOut, ShieldCheck, LogIn as LogInIcon } from 'lucide-react'; // დაემატა LogInIcon
import { useAuth } from '@/contexts/AuthContext'; // Auth Context-ის იმპორტი
import { Button } from '@/components/ui/button'; // Button იმპორტი, თუ იყენებთ Logout-ისთვის
import { toast } from 'sonner'; // toast-ის იმპორტი

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, isLoading: authLoading } = useAuth(); // ვიღებთ user-ს, signOut-ს და authLoading-ს
  const navigate = useNavigate();

  const navLinkBaseStyle = "py-2 px-3 rounded-md font-medium transition-colors duration-150 ease-in-out text-sm";
  const navLinkDefaultStyle = "text-gray-300 hover:text-[#ffc125] hover:bg-[#1f2028]";
  const navLinkActiveStyle = "text-[#0a0e15] bg-[#ffc125] shadow-md";

  const adminButtonBaseStyle = "py-2 px-3 rounded-md font-medium shadow-sm transition-colors duration-150 ease-in-out text-sm flex items-center"; // flex items-center
  const adminButtonDefaultStyle = "text-gray-300 bg-[#1f2028] hover:text-[#ffc125] hover:bg-[#1f2028]/70";
  const adminButtonActiveStyle = "text-[#0a0e15] bg-[#ffc125] hover:bg-[#ffc125]/90";

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
      navigate('/'); 
      toast.success("Successfully logged out.");
    } catch (error) {
      // signOut ფუნქციაში უკვე არის toast.error, თუ შეცდომა მოხდა
      console.error("Navbar signout error", error);
    }
  };

  const renderNavLinks = (isMobile = false) => (
    <>
      <Link
        to="/overall"
        className={`${navLinkBaseStyle} ${isMobile ? 'block w-full text-left px-3' : 'inline-block'} ${currentPath === '/overall' ? navLinkActiveStyle : navLinkDefaultStyle}`}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        Overall
      </Link>
      {MINI_GAMES.map((game) => (
        <Link
          key={game.id}
          to={`/mini-game/${game.id}`}
          className={`${navLinkBaseStyle} ${isMobile ? 'block w-full text-left px-3' : 'inline-block'} ${currentPath === `/mini-game/${game.id}` ? navLinkActiveStyle : navLinkDefaultStyle}`}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          {game.name}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="bg-[#0a0e15] border-b-2 border-[#ffc125] shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center" onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}>
            <span className="font-minecraft text-[#ffc125] text-xl hover:opacity-80 transition-opacity">MC Tier List</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {renderNavLinks()}
          </div>

          <div className="flex items-center space-x-2">
            {authLoading ? (
              <div className="w-8 h-8 rounded-full animate-pulse bg-gray-700"></div> // ჩატვირთვის ინდიკატორი
            ) : user ? (
              <>
                <Link
                  to="/admin"
                  className={`${adminButtonBaseStyle} ${currentPath.startsWith('/admin') ? adminButtonActiveStyle : adminButtonDefaultStyle}`}
                >
                  <ShieldCheck className="mr-1.5 h-4 w-4" /> Admin Panel
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm" // მცირე ზომა
                  className="border-[#ffc125]/50 text-[#ffc125]/90 hover:bg-[#1f2028] hover:text-[#ffc125] flex items-center px-3" // დაშორება დაკორექტირდა
                >
                  <LogOut className="mr-1.5 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <Link
                to="/login" // ადმინ პანელის ლინკი გადადის ლოგინზე, თუ არაა ავტორიზებული
                className={`${adminButtonBaseStyle} ${adminButtonDefaultStyle}`}
              >
                 <LogInIcon className="mr-1.5 h-4 w-4" /> Login {/* შეიცვალა იკონი და ტექსტი */}
              </Link>
            )}
            
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-[#ffc125] hover:bg-[#1f2028] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#ffc125]"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t-2 border-[#1f2028] bg-[#0a0e15]" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderNavLinks(true)}
            <div className="pt-2 mt-2 border-t border-[#1f2028]/50">
              {authLoading ? null : user ? (
                <>
                  <Link
                    to="/admin"
                    className={`${navLinkBaseStyle} ${navLinkDefaultStyle} block w-full text-left px-3 flex items-center`} // იგივე სტილი რაც სხვა ლინკებს
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShieldCheck className="mr-1.5 h-4 w-4" /> Admin Panel
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className={`${navLinkBaseStyle} ${navLinkDefaultStyle} block w-full text-left px-3 flex items-center`}
                  >
                    <LogOut className="mr-1.5 h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className={`${navLinkBaseStyle} ${navLinkDefaultStyle} block w-full text-left px-3 flex items-center`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogInIcon className="mr-1.5 h-4 w-4" /> Admin Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;