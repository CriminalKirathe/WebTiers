import React, { useState, useEffect /* useEffect შეიძლება არ იყოს საჭირო აქ */ } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MINI_GAMES } from '@/utils/types';
import { Menu, X, LogOut, ShieldCheck, Search as SearchIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient'; // <<<--- დაამატეთ Supabase კლიენტის იმპორტი

// SVG ფაილების იმპორტი (უცვლელი)
import vanillaIconUrl from '@/assets/icons/gamemodes/vanila.svg';
import axeIconUrl from '@/assets/icons/gamemodes/axe.svg';
import maceIconUrl from '@/assets/icons/gamemodes/mace.svg';
import netheriteIconUrl from '@/assets/icons/gamemodes/netherite.svg';
import overallIconUrl from '@/assets/overall.svg';
import potIconUrl from '@/assets/icons/gamemodes/pot.svg';
import uhcIconUrl from '@/assets/icons/gamemodes/uhc.svg';
import swordIconUrl from '@/assets/icons/gamemodes/sword.svg';
import smpIconUrl from '@/assets/icons/gamemodes/smp.svg';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingPlayer, setIsSearchingPlayer] = useState(false); // ძებნისას loading state (სურვილისამებრ)

  const commonLinkStyles = "rounded-md font-medium transition-colors duration-150 ease-in-out text-sm";
  const defaultTextAndHover = "text-gray-300 hover:text-[#ffc125] hover:bg-[#1f2028]";
  const activeTextAndBg = "text-[#0a0e15] bg-[#ffc125] shadow-md";

  const adminButtonBaseStyle = "py-2 px-3 rounded-md font-medium shadow-sm transition-colors duration-150 ease-in-out text-sm flex items-center";
  const adminButtonDefaultStyle = "text-gray-300 bg-[#1f2028] hover:text-[#ffc125] hover:bg-[#1f2028]/70";
  const adminButtonActiveStyle = "text-[#0a0e15] bg-[#ffc125] hover:bg-[#ffc125]/90";

  const miniGameIcons: Record<string, string> = {
    vanilla: vanillaIconUrl,
    axe: axeIconUrl,
    mace: maceIconUrl,
    netherite: netheriteIconUrl,
    potpvp: potIconUrl,
    uhc: uhcIconUrl,
    sword: swordIconUrl,
    smp: smpIconUrl,
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
      navigate('/');
      toast.success("Successfully logged out.");
    } catch (error) {
      console.error("Navbar signout error", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // ფუნქცია მოთამაშის ID-ის მოსაძებნად სახელით
  const fetchPlayerIdByUsername = async (username: string): Promise<string | null> => {
    if (!username) return null;
    setIsSearchingPlayer(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id') // ვიღებთ მხოლოდ ID-ს
        .eq('username', username) // ვეძებთ username სვეტში (დარწმუნდით, რომ ეს სვეტი არსებობს)
        .maybeSingle(); // აბრუნებს ერთ ჩანაწერს ან null-ს

      if (error && error.code !== 'PGRST116') { // PGRST116 ნიშნავს, რომ ჩანაწერი არ მოიძებნა, რაც არაა შეცდომა maybeSingle-სთვის
        console.error('Error fetching player ID by username:', error);
        toast.error(`Error finding player: ${error.message}`);
        return null;
      }
      return data ? data.id : null;
    } catch (e) {
      console.error('Unexpected error fetching player ID:', e);
      toast.error('An unexpected search error occurred.');
      return null;
    } finally {
      setIsSearchingPlayer(false);
    }
  };

  const handleSearchSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      toast.info("Please enter a player name to search.");
      return;
    }

    const playerId = await fetchPlayerIdByUsername(trimmedQuery);

    if (playerId) {
      navigate(`/player/${playerId}`); // ნავიგაცია ხდება მოძებნილი ID-ით
      setSearchQuery('');
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    } else {
      toast.error(`Player "${trimmedQuery}" not found.`);
    }
  };

  const renderNavLinks = (isMobile = false) => (
    <>
      <Link
        to="/overall"
        title="Overall Rankings"
        className={`${commonLinkStyles} ${currentPath === '/overall' ? activeTextAndBg : defaultTextAndHover} 
                     ${isMobile ? 'flex items-center w-full text-left px-3 py-2' 
                       : 'inline-flex flex-col items-center justify-center text-center p-1 h-full w-[70px] sm:w-[80px]'}`}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        <img src={overallIconUrl} alt="Overall icon" className={` ${isMobile ? 'w-4 h-4 mr-2' : 'w-5 h-5 mb-0.5'}`} />
        <span className={isMobile ? '' : 'text-xs leading-tight mt-0.5'}>Overall</span>
      </Link>

      {MINI_GAMES.map((game) => {
        const isActive = currentPath === `/mini-game/${game.id}`;
        const iconUrl = miniGameIcons[game.id.toLowerCase()];

        if (iconUrl && !isMobile) {
          return (
            <Link
              key={game.id}
              to={`/mini-game/${game.id}`}
              title={game.name}
              className={`${commonLinkStyles} ${isActive ? activeTextAndBg : defaultTextAndHover} 
                           inline-flex flex-col items-center justify-center text-center p-1 h-full w-[70px] sm:w-[80px]`}
            >
              <img src={iconUrl} alt={`${game.name} icon`} className="w-5 h-5 mb-0.5" />
              <span className="text-xs leading-tight mt-0.5">{game.name}</span>
            </Link>
          );
        } else { 
          return (
            <Link
              key={game.id}
              to={`/mini-game/${game.id}`}
              className={`${commonLinkStyles} ${isMobile ? 'block w-full text-left px-3 py-2' : 'inline-flex items-center justify-center px-3 py-2 h-full'} ${isActive ? activeTextAndBg : defaultTextAndHover} ${isMobile && iconUrl ? 'flex items-center' : ''}`}
              onClick={() => isMobile && setIsMobileMenuOpen(false)}
            >
              {isMobile && iconUrl && (
                <img src={iconUrl} alt={`${game.name} icon`} className="w-4 h-4 mr-2" />
              )}
              {(!iconUrl && isMobile) && <span className="w-4 mr-2"></span>}
              {game.name}
            </Link>
          );
        }
      })}
    </>
  );

  return (
    <nav className="bg-[#0a0e15] border-b-2 border-[#ffc125] shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          <Link to="/" className="flex items-center" onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}>
            <span className="font-minecraft text-[#ffc125] text-xl hover:opacity-80 transition-opacity">MC Tier List</span>
          </Link>

          <div className="hidden md:flex items-stretch space-x-1"> 
            {renderNavLinks()}
          </div>

          <div className="flex items-center space-x-3"> 
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-[15px] w-[15px] text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="მოთამაშის ძებნა..."
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={isSearchingPlayer} // სურვილისამებრ: ძებნისას ველი ითიშება
                className="bg-[#1f2028] text-gray-300 placeholder-gray-500 text-sm rounded-md pl-9 pr-3 py-1.5 h-9 focus:ring-1 focus:ring-[#ffc125] focus:border-[#ffc125] focus:outline-none transition-colors duration-150 ease-in-out disabled:opacity-70"
                style={{ minWidth: '160px', maxWidth: '220px' }}
              />
              {/* თუ გინდათ ღილაკი, შეგიძლიათ დაამატოთ disabled={isSearchingPlayer} აქაც */}
            </form>

            {authLoading ? (
              <div className="w-8 h-8 rounded-full animate-pulse bg-gray-700"></div>
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
                  size="sm"
                  className="border-[#ffc125]/50 text-[#ffc125]/90 hover:bg-[#1f2028] hover:text-[#ffc125] flex items-center px-3 h-9"
                >
                  <LogOut className="mr-1.5 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              null 
            )}
            
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                disabled={isSearchingPlayer}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-[#ffc125] hover:bg-[#1f2028] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#ffc125] disabled:opacity-70"
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

            <form onSubmit={handleSearchSubmit} className="px-1 py-2">
              <input
                type="text"
                placeholder="მოთამაშის ძებნა..."
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={isSearchingPlayer}
                className="block w-full px-3 py-2 text-sm rounded-md bg-[#1f2028] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-[#ffc125] disabled:opacity-70"
              />
            </form>
            
            <div className="pt-2 mt-2 border-t border-[#1f2028]/50">
              {authLoading ? null : user ? (
                <>
                  <Link
                    to="/admin"
                    className={`${commonLinkStyles} ${defaultTextAndHover} block w-full text-left px-3 py-2 flex items-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShieldCheck className="mr-1.5 h-4 w-4" /> Admin Panel
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className={`${commonLinkStyles} ${defaultTextAndHover} block w-full text-left px-3 py-2 flex items-center`}
                  >
                    <LogOut className="mr-1.5 h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                null 
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;