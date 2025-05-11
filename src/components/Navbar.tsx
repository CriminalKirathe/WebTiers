import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MINI_GAMES } from '@/utils/types';
import { Menu, X, LogOut, ShieldCheck, Search as SearchIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

// SVG ფაილების იმპორტი (უცვლელი)
import vanillaIconUrl from '@/assets/icons/gamemodes/vanila.svg';
import axeIconUrl from '@/assets/icons/gamemodes/axe.svg';
import maceIconUrl from '@/assets/icons/gamemodes/mace.svg';
import netheriteIconUrl from '@/assets/icons/gamemodes/netherite.svg';
import overallIconUrl from '@/assets/icons/overall.svg';
import potIconUrl from '@/assets/icons/gamemodes/pot.svg';
import uhcIconUrl from '@/assets/icons/gamemodes/uhc.svg';
import swordIconUrl from '@/assets/icons/gamemodes/sword.svg';
import smpIconUrl from '@/assets/icons/gamemodes/smp.svg';
import elytraIconUrl from '@/assets/icons/gamemodes/elytra.webp'

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingPlayer, setIsSearchingPlayer] = useState(false);

  const commonLinkStyles = "rounded-md font-medium transition-colors duration-150 ease-in-out text-sm";
  const defaultTextAndHover = "text-gray-300 hover:text-[#ffc125] hover:bg-[#1f2028]";
  const activeTextAndBg = "text-[#0a0e15] bg-[#ffc125] shadow-md";

  const miniGameIcons: Record<string, string> = {
    vanilla: vanillaIconUrl,
    axe: axeIconUrl,
    mace: maceIconUrl,
    netherite: netheriteIconUrl,
    potpvp: potIconUrl,
    uhc: uhcIconUrl,
    sword: swordIconUrl,
    smp: smpIconUrl,
    elytra: elytraIconUrl,
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

  const fetchPlayerIdByUsername = async (username: string): Promise<string | null> => {
    if (!username) return null;
    setIsSearchingPlayer(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
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
      navigate(`/player/${playerId}`);
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
                  ${isMobile 
                    ? 'flex items-center w-full text-left px-3 py-2' 
                    // აქ `lg:` და `xl:` პრეფიქსები რჩება, რადგან ისინი განსაზღვრავენ დესკტოპის ვერსიის შიდა სტილებს,
                    // და არა მენიუს გამოჩენა/დამალვას. თუ გსურთ ესენიც 1100px-ზე შეიცვალოს, `lg:` უნდა გახდეს `navbreak:`
                    : 'inline-flex flex-col items-center justify-center text-center p-1 h-full navbreak:w-[70px] xl:w-[80px] flex-shrink-0'
                  }`}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        <img src={overallIconUrl} alt="Overall icon" className={` ${isMobile ? 'w-4 h-4 mr-2' : 'w-5 h-5 mb-0.5'}`} />
        <span className={`${isMobile ? '' : 'text-xs leading-tight mt-0.5'} ${!isMobile ? 'truncate w-full' : ''}`}>
            Overall
        </span>
      </Link>

      {MINI_GAMES.map((game, index) => {
        const isActive = currentPath === `/mini-game/${game.id}`;
        const iconUrl = miniGameIcons[game.id.toLowerCase()];
        
        if (iconUrl && !isMobile) {
          return (
            <Link
              key={game.id}
              to={`/mini-game/${game.id}`}
              title={game.name}
              className={`${commonLinkStyles} ${isActive ? activeTextAndBg : defaultTextAndHover}
                          inline-flex flex-col items-center justify-center text-center p-1 h-full 
                          navbreak:w-[70px] xl:w-[80px] flex-shrink-0 
                          ${index >= 3 ? 'hidden xl:inline-flex' : ''} `} // აქაც `navbreak:`-ის გამოყენება შეიძლება `lg:`-ს ნაცვლად, თუ გვინდა რომ ეს ლოგიკა 1100px-ზეც გავრცელდეს
              onClick={() => isMobile && setIsMobileMenuOpen(false)}
            >
              <img src={iconUrl} alt={`${game.name} icon`} className="w-5 h-5 mb-0.5" />
              <span className="text-xs leading-tight mt-0.5 truncate w-full">{game.name}</span>
            </Link>
          );
        } else if (isMobile) { 
          return (
            <Link
              key={game.id}
              to={`/mini-game/${game.id}`}
              className={`${commonLinkStyles} block w-full text-left px-3 py-2 ${isActive ? activeTextAndBg : defaultTextAndHover} ${iconUrl ? 'flex items-center' : ''}`}
              onClick={() => isMobile && setIsMobileMenuOpen(false)}
            >
              {iconUrl && (
                <img src={iconUrl} alt={`${game.name} icon`} className="w-4 h-4 mr-2 flex-shrink-0" />
              )}
              {(!iconUrl) && <span className="w-4 mr-2 flex-shrink-0"></span>}
              {game.name}
            </Link>
          );
        }
        return null; 
      })}
    </>
  );

  return (
    <nav className="bg-[#0a0e15] border-b-2 border-[#ffc125] shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16">
          
          <Link to="/" className="flex items-center flex-shrink-0 mr-2 navbreak:mr-4" onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}>
            <span className="font-minecraft text-[#ffc125] text-lg sm:text-xl hover:opacity-80 transition-opacity">GeoTiers</span>
          </Link>

          {/* Desktop Navigation Links Container - ახლა navbreak-დან გამოჩნდება */}
          <div className="hidden navbreak:flex flex-grow items-center justify-center space-x-1 min-w-0 px-1 overflow-x-auto scrollbar-hide">
            {renderNavLinks(false)}
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0"> 
            {/* საძიებო ველი - გამოჩნდეს sm-დან */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative">
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none navbreak:left-3 navbreak:h-[15px] navbreak:w-[15px]" />
              <input
                type="text"
                placeholder="ძებნა..." 
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={isSearchingPlayer}
                className="bg-[#1f2028] text-gray-300 placeholder-gray-500 text-xs rounded-md 
                           pl-7 pr-2 py-1 h-8 focus:ring-1 focus:ring-[#ffc125] focus:border-[#ffc125] focus:outline-none 
                           transition-colors duration-150 ease-in-out disabled:opacity-70
                           w-24 sm:w-28 md:w-32 navbreak:w-auto navbreak:min-w-[160px] navbreak:max-w-[220px] navbreak:text-sm navbreak:h-9 navbreak:py-1.5 navbreak:pl-9 navbreak:pr-3"
              />
            </form>

            {authLoading ? (
              <div className="w-8 h-8 rounded-full animate-pulse bg-gray-700"></div>
            ) : user ? (
              <>
                <Link
                  to="/admin"
                  className={`rounded-md font-medium shadow-sm transition-colors duration-150 ease-in-out flex items-center 
                                 h-8 px-2 text-xs navbreak:h-9 navbreak:px-3 navbreak:text-sm
                                 ${currentPath.startsWith('/admin') 
                                   ? 'text-[#0a0e15] bg-[#ffc125] hover:bg-[#ffc125]/90' 
                                   : 'text-gray-300 bg-[#1f2028] hover:text-[#ffc125] hover:bg-[#1f2028]/70'}`}
                >
                  <ShieldCheck className="mr-1 h-3.5 w-3.5 navbreak:mr-1.5 navbreak:h-4 navbreak:w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-[#ffc125]/50 text-[#ffc125]/90 hover:bg-[#1f2028] hover:text-[#ffc125] 
                                 flex items-center h-8 px-2 text-xs navbreak:h-9 navbreak:px-3 navbreak:text-sm"
                >
                  <LogOut className="mr-1 h-3.5 w-3.5 navbreak:mr-1.5 navbreak:h-4 navbreak:w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              null 
            )}
            
            {/* Mobile Menu Toggle - ახლა navbreak-მდე გამოჩნდება */}
            <div className="navbreak:hidden"> 
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                disabled={isSearchingPlayer}
                className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-md text-gray-300 hover:text-[#ffc125] hover:bg-[#1f2028] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#ffc125] disabled:opacity-70"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <X className="block h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="block h-5 w-5 sm:h-6 sm:w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* მობილური მენიუ */}
      {isMobileMenuOpen && (
        // აქაც navbreak:hidden
        <div className="navbreak:hidden border-t-2 border-[#1f2028] bg-[#0a0e15]" id="mobile-menu"> 
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
                  <Link to="/admin" className={`${commonLinkStyles} ${defaultTextAndHover} block w-full text-left px-3 py-2 flex items-center`} onClick={() => setIsMobileMenuOpen(false)}>
                    <ShieldCheck className="mr-1.5 h-4 w-4" /> Admin Panel
                  </Link>
                  <button onClick={handleSignOut} className={`${commonLinkStyles} ${defaultTextAndHover} block w-full text-left px-3 py-2 flex items-center`}>
                    <LogOut className="mr-1.5 h-4 w-4" /> Logout
                  </button>
                </>
              ) : ( null )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;