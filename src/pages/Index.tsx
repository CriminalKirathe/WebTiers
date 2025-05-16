import React from 'react';
// import { Link } from 'react-router-dom'; // თუ არ იყენებთ, შეგიძლიათ წაშალოთ
// Card, CardHeader, CardContent, CardTitle შეიძლება ნაკლებად გამოვიყენოთ ან სხვანაირად
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MINI_GAMES, TIER_POINTS, TierRating } from '@/utils/types'; // დარწმუნდით, რომ ეს ფაილი განახლებულია!
import { 
  ShieldCheck, Swords, Box, Layers, MessageSquareText,
  ListChecks, Gem, Info, FileText, ChevronRight, ExternalLink,
  Flame, Sword, Axe, Hammer, Zap, Users, Mail, Star, Gamepad2, HelpCircle, Settings
} from 'lucide-react';

const getMiniGameIcon = (gameId: string, className: string = "w-5 h-5 mr-2 inline-block"): React.ReactNode => {
  switch (gameId.toLowerCase()) {
    case 'vanilla': return <Box className={className} />;
    case 'uhc': return <ShieldCheck className={className} />;
    case 'potpvp': return <Swords className={className} />;
    case 'smp': return <Layers className={className} />;
    case 'netherite': return <Flame className={className} />;
    case 'sword': return <Sword className={className} />;
    case 'axe': return <Axe className={className} />;
    case 'mace': return <Hammer className={className} />;
    default: return <Gamepad2 className={className} />;
  }
};

const PointExamples = () => {
  const exampleTiers: TierRating[] = ["ht1", "lt1", "ht2", "lt2", "ht3", "lt3", "ht4", "lt4", "ht5", "lt5"];
  const pointsToShow = exampleTiers.filter(tier => TIER_POINTS[tier] !== undefined);

  return (
    <div className="mt-4 p-4 bg-[#0a0e15]/60 rounded-lg border border-[#ffc125]/30 shadow-inner">
      <h4 className="text-md font-semibold text-[#ffc125]/90 mb-3 flex items-center">
        <Star className="w-4 h-4 mr-2 text-[#ffc125]/70" />
        ქულების განაწილების მაგალითები:
      </h4>
      <ul className="space-y-2 text-sm">
        {pointsToShow.map(tier => (
          <li key={tier} className="flex justify-between items-center p-2.5 bg-[#1f2028]/70 rounded-md hover:bg-[#1f2028] transition-colors duration-200 ease-in-out">
            <span className="font-medium text-gray-300 flex items-center">
              <ChevronRight className="w-4 h-4 mr-1.5 text-[#ffc125]/70 flex-shrink-0" />
              {tier.toUpperCase()}
            </span>
            <span className="text-[#ffc125] font-bold text-base">{TIER_POINTS[tier]} ქულა</span>
          </li>
        ))}
        {Object.keys(TIER_POINTS).length > pointsToShow.length && (
          <li className="text-center text-gray-500 pt-2 text-xs italic">
            და სხვა ტიერები შესაბამისი ქულებით...
          </li>
        )}
      </ul>
    </div>
  );
};

const InfoBlock = ({ icon: Icon, title, children, titleColor = "text-[#ffc125]" }: { icon: React.ElementType, title: string, children: React.ReactNode, titleColor?: string }) => (
  <div className="bg-[#1f2028] p-6 rounded-xl shadow-xl hover:shadow-[#ffc125]/10 border border-[#ffc125]/20 hover:border-[#ffc125]/50 transition-all duration-300 transform hover:scale-[1.03] group">
    <div className="flex items-center mb-4">
      <div className="p-2.5 bg-[#0a0e15] rounded-lg mr-4 group-hover:bg-[#ffc125]/10 transition-colors duration-300">
        <Icon className={`w-7 h-7 ${titleColor === "text-[#ffc125]" ? "text-[#ffc125]" : "text-[#ffc125]/80"} group-hover:text-[#ffc125] transition-colors duration-300`} />
      </div>
      <h3 className={`text-xl sm:text-2xl font-semibold ${titleColor} group-hover:brightness-125 transition-all duration-300`}>{title}</h3>
    </div>
    <div className="text-gray-400 text-sm sm:text-base leading-relaxed space-y-3">
      {children}
    </div>
  </div>
);


const Index = () => {
  const generalDiscordLink = "YOUR_MAIN_DISCORD_INVITE_LINK"; 

  const discordServersForMiniGames = MINI_GAMES.filter(
    game => game.discordLink && game.discordLink.trim() !== ''
  );

  return (
    <div className="bg-[#0a0e15] text-gray-300 min-h-screen font-sans selection:bg-[#ffc125] selection:text-[#0a0e15]">

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-20 md:space-y-28">
        
        <section id="about-system-section" className="scroll-mt-24">
          <div className="text-center mb-14 md:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#ffc125] mb-4">
              ჩვენი ტიერების სისტემის მიმოხილვა
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              გამჭვირვალე ახსნა, თუ როგორ ვაფასებთ მოთამაშეებს და რას ნიშნავს ტიერების რეიტინგები.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            <InfoBlock icon={Info} title="რა არის ტიერლისტი?">
              <p>ტიერლისტი არის რანგირების სისტემა, რომელიც ხშირად გამოიყენება ვიდეო თამაშებში ელემენტების (მაგალითად, პერსონაჟების, იარაღების, ან ამ შემთხვევაში, მოთამაშეების) შესაფასებლად და დასალაგებლად მათი სიძლიერის ან ეფექტურობის მიხედვით. "S" ტიერი, როგორც წესი, უმაღლეს რანგს აღნიშნავს, რასაც მოჰყვება A, B, C და D ტიერები, რომლებიც კლებადობით მიუთითებენ ეფექტურობაზე.</p>
            </InfoBlock>

            <InfoBlock icon={ListChecks} title="როგორ მუშაობს ჩვენი სისტემა?">
              <p>ჩვენი Minecraft-ის მოთამაშეთა ტიერლისტი აფასებს მოთამაშეებს სხვადასხვა მინი-თამაშებში მათი შედეგების მიხედვით. თითოეულ მოთამაშეს ენიჭება ტიერი (მაგალითად, HT1, LT5, RHT2) კონკრეტული მინი-თამაშისთვის, რომელშიც მონაწილეობა მიიღო. ეს ინდივიდუალური ტიერები ჯამდება და განსაზღვრავს მოთამაშის საერთო ქულებს.</p>
            </InfoBlock>
            
            <div className="md:col-span-2 grid gap-8 lg:gap-10">
                <InfoBlock icon={Gem} title="ქულების მინიჭების პრინციპი">
                  <p>მოთამაშეები აგროვებენ ქულებს თითოეულ მინი-თამაშში მიღწეული ტიერის შესაბამისად. სისტემა აჯილდოებს მაღალ და სტაბილურ შედეგებს. ქულები ნაწილდება შემდეგნაირად:</p>
                  <PointExamples />
                  <p className="mt-3">მოთამაშის ჯამური ქულა არის ყველა მინი-თამაშში მიღებული ქულების ჯამი. "Overall Rankings" გვერდზე მოთამაშეები სწორედ ამ ჯამური ქულების მიხედვით არიან დალაგებული.</p>
                </InfoBlock>
            </div>
          </div>
        </section>

        <section id="contact-section" className="py-16 md:py-24 bg-[#1f2028] rounded-2xl shadow-2xl border border-[#0a0e15]/50 scroll-mt-24">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <HelpCircle className="w-16 h-16 text-[#ffc125] mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#ffc125] mb-5">
              ტაიერში მოსახვედრად შემოგვიერთდი
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12">

            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-5 sm:gap-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-transparent hover:bg-[#ffc125] hover:text-[#0a0e15] text-[#ffc125] font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 border-2 border-[#ffc125] group text-md min-w-[250px] transform hover:scale-105 flex items-center justify-center shadow-lg hover:shadow-[#ffc125]/30 focus:ring-2 focus:ring-[#ffc125]/50"
                  >
                    <MessageSquareText className="w-5 h-5 mr-3 transition-colors" />
                    Discord სერვერების ნახვა
                    <ChevronRight className="w-5 h-5 ml-auto opacity-70 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 duration-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="center" 
                  sideOffset={15}
                  className="bg-[#181920] border-2 border-[#ffc125]/30 text-gray-300 w-80 md:w-96 shadow-2xl rounded-xl p-2 backdrop-blur-sm bg-opacity-90"
                >
                  {generalDiscordLink && generalDiscordLink.trim() !== '' && generalDiscordLink !== 'YOUR_MAIN_DISCORD_INVITE_LINK' ? (
                    <>
                      <DropdownMenuLabel className="text-[#ffc125] px-3 py-2.5 text-sm font-bold tracking-wider">მთავარი სერვერი</DropdownMenuLabel>
                      <DropdownMenuItem asChild className="cursor-pointer hover:!bg-[#ffc125]/10 focus:!bg-[#ffc125]/20 hover:!text-[#ffc125] focus:!text-[#ffc125] rounded-lg m-1 p-0 transition-colors duration-150">
                        <a href={generalDiscordLink} target="_blank" rel="noopener noreferrer" className="flex items-center w-full px-3 py-3 text-sm">
                          <Users className="w-4 h-4 mr-3 text-[#ffc125]/80" />
                          ზოგადი საზოგადოება
                          <ExternalLink className="w-4 h-4 ml-auto text-gray-500 group-hover:text-[#ffc125]/70 transition-colors duration-150" />
                        </a>
                      </DropdownMenuItem>
                    </>
                  ) : null }

                  {discordServersForMiniGames.length > 0 && (
                    <>
                      {(generalDiscordLink && generalDiscordLink.trim() !== '' && generalDiscordLink !== 'YOUR_MAIN_DISCORD_INVITE_LINK' && discordServersForMiniGames.length > 0) && 
                        <DropdownMenuSeparator className="bg-[#ffc125]/20 my-2 mx-1" />}
                      <DropdownMenuLabel className="text-[#ffc125] px-3 py-2.5 text-sm font-bold tracking-wider">მინი-თამაშების სერვერები</DropdownMenuLabel>
                      <div className="grid grid-cols-2 gap-1 p-1">
                        {discordServersForMiniGames.map((game) => (
                          <DropdownMenuItem key={game.id} asChild className="cursor-pointer hover:!bg-[#ffc125]/10 focus:!bg-[#ffc125]/20 hover:!text-[#ffc125] focus:!text-[#ffc125] rounded-lg p-0 transition-colors duration-150">
                            <a href={game.discordLink!} target="_blank" rel="noopener noreferrer" className="flex items-center w-full px-2.5 py-2.5 text-xs sm:text-sm">
                              {getMiniGameIcon(game.id, "w-4 h-4 mr-2 shrink-0 text-[#ffc125]/80")}
                              <span className="truncate flex-grow mr-1">{game.name}</span>
                              <ExternalLink className="w-3.5 h-3.5 ml-auto shrink-0 text-gray-500 group-hover:text-[#ffc125]/70 transition-colors duration-150" />
                            </a>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {discordServersForMiniGames.length === 0 && 
                   (!generalDiscordLink || generalDiscordLink.trim() === '' || generalDiscordLink === 'YOUR_MAIN_DISCORD_INVITE_LINK') && (
                     <DropdownMenuItem disabled className="text-gray-500 px-3 py-3 italic text-sm">დისკორდ სერვერები არ არის მითითებული.</DropdownMenuItem>
                  )}
                  {discordServersForMiniGames.length === 0 && 
                   (generalDiscordLink && generalDiscordLink.trim() !== '' && generalDiscordLink !== 'YOUR_MAIN_DISCORD_INVITE_LINK') && ( 
                     <DropdownMenuItem disabled className="text-gray-500 px-3 py-3 italic text-sm">მინი-თამაშების სხვა სერვერი არ მოიძებნა.</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {generalDiscordLink && generalDiscordLink.trim() !== '' && generalDiscordLink !== 'YOUR_MAIN_DISCORD_INVITE_LINK' && (
                 <Button 
                    asChild
                    className="bg-[#ffc125] text-[#0a0e15] hover:brightness-90 font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 min-w-[250px] transform hover:scale-105 shadow-lg hover:shadow-[#ffc125]/40 focus:ring-2 focus:ring-[#ffc125]/50 flex items-center justify-center"
                  >
                    <a href={generalDiscordLink} target="_blank" rel="noopener noreferrer">
                      <Mail className="w-5 h-5 mr-2.5" /> მთავარ Discord-ზე გადასვლა
                    </a>
                  </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 text-center border-t-2 border-[#1f2028]/70 mt-16">
        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Minecraft Player Tier List. ყველა უფლება დაცულია.</p>
        <p className="text-xs text-gray-600 mt-2">შექმნილია საზოგადოებისთვის <span className="text-[#ffc125]/50">❤</span></p>
      </footer>
      
      <style jsx global>{`
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-700 { animation-delay: 0.7s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .font-minecraft { /* დარწმუნდით, რომ ეს ფონტი ჩატვირთულია */ }
        .animate-minecraft-float { /* თქვენი float ანიმაცია */ } 
      `}</style>
    </div>
  );
};

export default Index;