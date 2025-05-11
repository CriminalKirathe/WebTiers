import React from 'react';
// import { Link } from 'react-router-dom'; // თუ არ იყენებთ, შეგიძლიათ წაშალოთ
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Trophy, Gamepad2, Settings2, ShieldCheck, Swords, Box, Layers, Mail, MessageSquareText,
  HelpCircle, Settings, ListChecks, Gem, Info, FileText, ChevronRight, ExternalLink,
  Flame, Sword, Axe, Hammer,
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
  const exampleTiers: TierRating[] = ["ht1", "lt1", "ht2", "lt2", "ht5", "lt5", "rht1", "rlt1"];
  const pointsToShow = exampleTiers.filter(tier => TIER_POINTS[tier] !== undefined);

  return (
    <ul className="mt-2 space-y-1.5 text-gray-400">
      {pointsToShow.map(tier => (
        <li key={tier} className="flex items-center">
          <ChevronRight className="w-4 h-4 mr-2 text-[#ffc125]/70 flex-shrink-0" />
          <span className="font-medium text-gray-300">{tier.toUpperCase()}</span>: {TIER_POINTS[tier]} ქულა
        </li>
      ))}
      {Object.keys(TIER_POINTS).length > pointsToShow.length &&
        <li className="flex items-center">
          <ChevronRight className="w-4 h-4 mr-2 text-[#ffc125]/70 flex-shrink-0" />
          <span>და სხვა ტიერები შესაბამისი ქულებით...</span>
        </li>
      }
    </ul>
  );
};

const Index = () => {
  const cardBaseClasses = "bg-[#1f2028] rounded-xl shadow-xl dark:shadow-[0_8px_20px_rgba(255,193,37,0.07)] border border-transparent hover:border-[#ffc125]/40 transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer h-full flex flex-col";
  const cardHeaderClasses = "pb-3 pt-5 border-b border-[#0a0e15]/50";
  const cardTitleClasses = "text-[#ffc125] font-semibold text-lg sm:text-xl flex items-center";
  const cardContentClasses = "pt-4 text-gray-400 text-sm flex-grow";

  // !!! მნიშვნელოვანია: ჩაანაცვლეთ ეს თქვენი რეალური მთავარი Discord სერვერის ლინკით !!!
  const generalDiscordLink = "YOUR_MAIN_DISCORD_INVITE_LINK"; 

  // ფილტრავს მინი-თამაშებს, რომლებსაც აქვთ ვალიდური discordLink
  // MINI_GAMES უნდა მოდიოდეს თქვენი განახლებული types.ts ფაილიდან
  const discordServersForMiniGames = MINI_GAMES.filter(
    game => game.discordLink && game.discordLink.trim() !== ''
  );

  return (
    <div className="bg-[#0a0e15] text-gray-300 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center mb-12 md:mb-16">
           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-minecraft text-[#ffc125] mb-4 animate-minecraft-float">
             Minecraft Player Tier List
           </h1>
           <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
             View player rankings across different mini-games and competitive modes.
           </p>
         </div>

         <section className="mb-12 md:mb-16">
           <Card className="bg-[#1f2028] border border-[#0a0e15]/50 shadow-lg dark:shadow-[0_8px_30px_rgba(255,193,37,0.06)] rounded-lg p-6 md:p-8">
             <CardHeader className="p-0 mb-6 sm:mb-8 text-center">
               <CardTitle className="text-2xl sm:text-3xl font-semibold text-[#ffc125]">
                 ჩვენი ტიერლისტების სისტემის შესახებ
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0 text-gray-300 space-y-6 text-sm sm:text-base leading-relaxed">
                <div>
                  <h3 className="flex items-center font-semibold text-lg sm:text-xl text-[#ffc125]/90 mb-2">
                    <Info className="w-5 h-5 mr-2.5 text-[#ffc125]/70 flex-shrink-0" />
                    რა არის ტიერლისტი?
                  </h3>
                  <p className="pl-8 text-gray-400">ტიერლისტი არის რანგირების სისტემა, რომელიც ხშირად გამოიყენება ვიდეო თამაშებში ელემენტების (მაგალითად, პერსონაჟების, იარაღების, ან ამ შემთხვევაში, მოთამაშეების) შესაფასებლად და დასალაგებლად მათი სიძლიერის ან ეფექტურობის მიხედვით. "S" ტიერი, როგორც წესი, უმაღლეს რანგს აღნიშნავს, რასაც მოჰყვება A, B, C და D ტიერები, რომლებიც კლებადობით მიუთითებენ ეფექტურობაზე.</p>
                </div>
                <div>
                  <h3 className="flex items-center font-semibold text-lg sm:text-xl text-[#ffc125]/90 mb-2">
                    <ListChecks className="w-5 h-5 mr-2.5 text-[#ffc125]/70 flex-shrink-0" />
                    როგორ მუშაობს ჩვენი სისტემა?
                  </h3>
                  <p className="pl-8 text-gray-400">ჩვენი Minecraft-ის მოთამაშეთა ტიერლისტი აფასებს მოთამაშეებს სხვადასხვა მინი-თამაშებში მათი შედეგების მიხედვით. თითოეულ მოთამაშეს ენიჭება ტიერი (მაგალითად, HT1, LT5, RHT2) კონკრეტული მინი-თამაშისთვის, რომელშიც მონაწილეობა მიიღო. ეს ინდივიდუალური ტიერები ჯამდება და განსაზღვრავს მოთამაშის საერთო ქულებს.</p>
                </div>
                <div>
                  <h3 className="flex items-center font-semibold text-lg sm:text-xl text-[#ffc125]/90 mb-2">
                    <Gem className="w-5 h-5 mr-2.5 text-[#ffc125]/70 flex-shrink-0" />
                    ქულების მინიჭების პრინციპი
                  </h3>
                  <div className="pl-8">
                    <p className="text-gray-400 mb-1">მოთამაშეები აგროვებენ ქულებს თითოეულ მინი-თამაშში მიღწეული ტიერის შესაბამისად. სისტემა აჯილდოებს მაღალ და სტაბილურ შედეგებს. ქულები ნაწილდება შემდეგნაირად:</p>
                    <PointExamples />
                    <p className="mt-3 text-gray-400">მოთამაშის ჯამური ქულა არის ყველა მინი-თამაშში მიღებული ქულების ჯამი. "Overall Rankings" გვერდზე მოთამაშეები სწორედ ამ ჯამური ქულების მიხედვით არიან დალაგებული.</p>
                  </div>
                </div>
                 <div>
                  <h3 className="flex items-center font-semibold text-lg sm:text-xl text-[#ffc125]/90 mb-2">
                    <FileText className="w-5 h-5 mr-2.5 text-[#ffc125]/70 flex-shrink-0" />
                    დამატებითი ინფორმაცია
                  </h3>
                  <p className="pl-8 text-gray-400">ჩვენი მიზანია შევქმნათ სამართლიანი და გამჭვირვალე რანგირების სისტემა Minecraft-ის მოთამაშეებისთვის. სისტემა მუდმივად განახლდება და იხვეწება თქვენი აქტიურობისა და გამოხმაურების საფუძველზე.</p>
                </div>
             </CardContent>
           </Card>
         </section>

        <section className="mt-16 md:mt-20 py-10 border-t-2 border-[#1f2028]">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#ffc125] text-center mb-8">
            Get In Touch
          </h2>
          <div className="max-w-2xl mx-auto text-center text-gray-400 space-y-5">
            <p className="text-lg">Have questions, suggestions, or want to get involved? Reach out to us!</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-[#1f2028] hover:bg-[#ffc125] hover:text-[#0a0e15] text-[#ffc125]/90 font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 border border-[#ffc125]/50 flex items-center group"
                  >
                    <MessageSquareText className="w-5 h-5 mr-2 transition-colors" />
                    Discord Servers
                    <ChevronRight className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1f2028] border-[#0a0e15]/80 text-gray-300 w-64 shadow-xl">
                  {generalDiscordLink && generalDiscordLink.trim() !== '' && generalDiscordLink !== 'YOUR_MAIN_DISCORD_INVITE_LINK' ? (
                    <>
                      <DropdownMenuLabel className="text-[#ffc125] px-2 py-1.5">მთავარი სერვერი</DropdownMenuLabel>
                      <DropdownMenuItem asChild className="cursor-pointer hover:!bg-[#0a0e15] focus:!bg-[#0a0e15] hover:!text-gray-100 focus:!text-gray-100">
                        <a href={generalDiscordLink} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                          <MessageSquareText className="w-4 h-4 mr-2.5 text-[#ffc125]/80" />
                          General Community
                          <ExternalLink className="w-3.5 h-3.5 ml-auto text-gray-500" />
                        </a>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    // თუ მთავარი ლინკი არ არის, შეგვიძლია გამოვტოვოთ ეს სექცია ან ვაჩვენოთ მესიჯი
                    // ამ შემთხვევაში, უბრალოდ გამოვტოვებთ მთავარი სერვერის ლეიბლს და აითემს, თუ ლინკი არასწორია
                    null 
                  )}

                  {discordServersForMiniGames.length > 0 && (
                    <>
                      {/* სეპარატორი მხოლოდ მაშინ, თუ მთავარი სერვერიც არის და გეიმმოდებიც */}
                      {generalDiscordLink && generalDiscordLink.trim() !== '' && generalDiscordLink !== 'YOUR_MAIN_DISCORD_INVITE_LINK' && <DropdownMenuSeparator className="bg-[#0a0e15]/50 my-1" />}
                      <DropdownMenuLabel className="text-[#ffc125] px-2 py-1.5">გეიმმოდების სერვერები</DropdownMenuLabel>
                      {discordServersForMiniGames.map((game) => (
                        <DropdownMenuItem key={game.id} asChild className="cursor-pointer hover:!bg-[#0a0e15] focus:!bg-[#0a0e15] hover:!text-gray-100 focus:!text-gray-100">
                          <a href={game.discordLink!} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                            {getMiniGameIcon(game.id, "w-4 h-4 mr-2.5 text-[#ffc125]/80")}
                            {game.name}
                            <ExternalLink className="w-3.5 h-3.5 ml-auto text-gray-500" />
                          </a>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                  
                  {/* შეტყობინებები იმის მიხედვით, თუ რა მონაცემებია ხელმისაწვდომი */}
                  {discordServersForMiniGames.length === 0 && 
                   (!generalDiscordLink || generalDiscordLink.trim() === '' || generalDiscordLink === 'YOUR_MAIN_DISCORD_INVITE_LINK') && (
                     <DropdownMenuItem disabled className="text-gray-500 px-2 py-1.5">დისკორდ სერვერები არ არის მითითებული.</DropdownMenuItem>
                  )}
                  {discordServersForMiniGames.length === 0 && 
                   (generalDiscordLink && generalDiscordLink.trim() !== '' && generalDiscordLink !== 'YOUR_MAIN_DISCORD_INVITE_LINK') && (
                     <DropdownMenuItem disabled className="text-gray-500 px-2 py-1.5 italic">სხვა გეიმმოდის სერვერი არ მოიძებნა.</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;