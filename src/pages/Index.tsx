import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MINI_GAMES, TIER_POINTS, TierRating } from '@/utils/types';
import { 
  Trophy, Gamepad2, Settings2, ShieldCheck, Swords, Box, Layers, Mail, MessageSquareText,
  HelpCircle, Settings, ListChecks, Gem, Info, FileText, ChevronRight // დამატებითი იკონები
} from 'lucide-react';

const getMiniGameIcon = (gameId: string): React.ReactNode => {
  switch (gameId.toLowerCase()) {
    case 'vanilla': return <Box className="w-5 h-5 mr-2 inline-block" />;
    case 'uhc': return <ShieldCheck className="w-5 h-5 mr-2 inline-block" />;
    case 'potpvp': return <Swords className="w-5 h-5 mr-2 inline-block" />;
    case 'smp': return <Layers className="w-5 h-5 mr-2 inline-block" />;
    default: return <Gamepad2 className="w-5 h-5 mr-2 inline-block" />;
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
  const cardContentClasses = "pt-4 text-gray-400 text-sm flex-grow"; // flex-grow მნიშვნელოვანია თანაბარი სიმაღლისთვის

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

        {/* ინფორმაციული სექცია */}
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
                  <Gem className="w-5 h-5 mr-2.5 text-[#ffc125]/70 flex-shrink-0" /> {/* Gem ან Star იკონი */}
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
              <a 
                href="YOUR_DISCORD_INVITE_LINK" // <<--- შეცვალეთ თქვენი Discord ლინკით
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-[#1f2028] hover:bg-[#ffc125] hover:text-[#0a0e15] text-[#ffc125]/90 font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 border border-[#ffc125]/50 flex items-center group"
              >
                <MessageSquareText className="w-5 h-5 mr-2 group-hover:text-[#0a0e15] transition-colors" /> 
                Join our Discord
              </a>
              <a 
                href="mailto:shakarishviliofficial@gmail.com" // <<--- შეცვალეთ თქვენი იმეილით
                className="bg-[#1f2028] hover:bg-[#ffc125] hover:text-[#0a0e15] text-[#ffc125]/90 font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 border border-[#ffc125]/50 flex items-center group"
              >
                <Mail className="w-5 h-5 mr-2 group-hover:text-[#0a0e15] transition-colors" />
                Email Us
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Index;