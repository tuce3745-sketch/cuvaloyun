import { useState, useEffect, useCallback, useRef } from 'react';
import {
  customers,
  dailyEvents,
  weatherEvents,
  storyIntro,
  endings,
  owlWisdom,
  SHOP_IMAGE,
  FOREST_BG,
  FINAL_GREEN,
  KUNDUZ_IMAGE,
  OWL_IMAGE,
  Customer,
  DecisionOption,
  WeatherEvent
} from './data/gameData';

type GamePhase = 'intro' | 'dayStart' | 'customerDecision' | 'dayEnd' | 'final';

interface GameState {
  day: number;
  money: number;
  carbon: number;
  satisfaction: number;
  trees: number;
  customersToday: Customer[];
  currentCustomerIndex: number;
  weather: WeatherEvent;
  decisionsMade: { day: number; customer: string; customerName: string; customerEmoji: string; choice: string; choiceLabel: string; moneyChange: number; carbonChange: number; satisfactionChange: number }[];
  failedPayments: number;
  phase: GamePhase;
  introStep: number;
  dayLog: string[];
  carbonHistory: number[];
  moneyHistory: number[];
}

const INITIAL_STATE: GameState = {
  day: 1,
  money: 300,
  carbon: 0,
  satisfaction: 80,
  trees: 0,
  customersToday: [],
  currentCustomerIndex: 0,
  weather: weatherEvents[0],
  decisionsMade: [],
  failedPayments: 0,
  phase: 'intro',
  introStep: 0,
  dayLog: [],
  carbonHistory: [0],
  moneyHistory: [300]
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomCustomers(count: number): Customer[] {
  return shuffleArray(customers).slice(0, count);
}

function getRandomWeather(day: number): WeatherEvent {
  if (day <= 2) return weatherEvents[0];
  if (day >= 7) {
    const extreme = weatherEvents.filter(w => w.id !== 'normal');
    return extreme[Math.floor(Math.random() * extreme.length)];
  }
  return weatherEvents[Math.floor(Math.random() * weatherEvents.length)];
}

// Particle effect component
function Particles({ type }: { type: 'leaves' | 'fireflies' | 'smoke' | 'sparkle' }) {
  const count = type === 'fireflies' ? 20 : 15;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
        };
        
        if (type === 'leaves') {
          return (
            <div key={i} className="particle-leaf absolute" style={style}>
              🍃
            </div>
          );
        }
        if (type === 'fireflies') {
          return (
            <div key={i} className="particle-firefly absolute" style={style}>
              ✨
            </div>
          );
        }
        if (type === 'smoke') {
          return (
            <div key={i} className="particle-smoke absolute" style={style}>
              <div className="w-4 h-4 bg-gray-400/20 rounded-full blur-sm" />
            </div>
          );
        }
        return (
          <div key={i} className="particle-sparkle absolute" style={style}>
            ⭐
          </div>
        );
      })}
    </div>
  );
}

// Anime-style dialog box
function DialogBox({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'warning' | 'success' | 'owl' }) {
  const borderColors = {
    default: 'border-amber-400/60',
    warning: 'border-red-400/60',
    success: 'border-green-400/60',
    owl: 'border-purple-400/60'
  };
  const bgColors = {
    default: 'from-slate-900/95 to-slate-800/95',
    warning: 'from-red-950/95 to-red-900/90',
    success: 'from-green-950/95 to-green-900/90',
    owl: 'from-purple-950/95 to-indigo-900/90'
  };
  
  return (
    <div className={`relative bg-gradient-to-b ${bgColors[variant]} backdrop-blur-md rounded-2xl border-2 ${borderColors[variant]} shadow-2xl overflow-hidden`}>
      {/* Anime-style corner decorations */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-300/40 rounded-tl-2xl" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-300/40 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-300/40 rounded-bl-2xl" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-300/40 rounded-br-2xl" />
      {/* Inner glow line */}
      <div className="absolute inset-1 rounded-xl border border-white/5" />
      <div className="relative p-6">
        {children}
      </div>
    </div>
  );
}

// Status bar component
function StatusBar({ game }: { game: GameState }) {
  return (
    <div className="relative bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-amber-500/30 shadow-2xl mb-4">
      {/* Top decorative line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <StatBox label="Gün" value={`${game.day}/10`} icon="📅" color="amber" progress={game.day * 10} />
        <StatBox label="Para" value={`${game.money}`} icon="💰" color={game.money < 100 ? 'red' : 'amber'} warning={game.money < 100} subtext="Günlük: -100" />
        <StatBox label="Karbon" value={`${game.carbon}/100`} icon="🌫️" color={game.carbon > 70 ? 'red' : game.carbon > 40 ? 'yellow' : 'green'} progress={game.carbon} warning={game.carbon > 70} />
        <StatBox label="Memnuniyet" value={`${game.satisfaction}`} icon="😊" color={game.satisfaction < 30 ? 'red' : 'blue'} progress={game.satisfaction} />
        <StatBox label="Fidanlar" value={`${game.trees}`} icon="🌱" color="green" subtext={`-${game.trees * 2} karbon/gün`} />
      </div>
      
      {game.weather.id !== 'normal' && (
        <div className="mt-3 text-center text-sm bg-black/30 rounded-lg py-2 px-3 border border-amber-500/20">
          <span className="text-amber-300 font-medium">{game.weather.emoji} {game.weather.name}:</span>
          <span className="text-green-200 ml-2">{game.weather.description}</span>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, icon, color, progress, warning, subtext }: {
  label: string; value: string; icon: string; color: string;
  progress?: number; warning?: boolean; subtext?: string;
}) {
  const colorMap: Record<string, string> = {
    amber: 'text-amber-300',
    red: 'text-red-400',
    green: 'text-green-400',
    yellow: 'text-yellow-300',
    blue: 'text-blue-300'
  };
  const barColorMap: Record<string, string> = {
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500'
  };
  
  return (
    <div className={`text-center bg-black/30 rounded-xl p-2 border border-white/5 ${warning ? 'animate-pulse border-red-500/30' : ''}`}>
      <div className="text-xs text-green-300/80 mb-0.5">{icon} {label}</div>
      <div className={`text-lg font-bold ${colorMap[color] || 'text-amber-300'}`}>{value}</div>
      {progress !== undefined && (
        <div className="w-full bg-gray-800 rounded-full h-1 mt-1">
          <div className={`h-1 rounded-full transition-all duration-700 ${barColorMap[color] || 'bg-amber-500'}`} style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
      )}
      {subtext && <div className="text-[10px] text-green-500/70 mt-0.5">{subtext}</div>}
    </div>
  );
}

function App() {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);
  const [animating, setAnimating] = useState(false);
  const [showOwlTip, setShowOwlTip] = useState(false);
  const [lastDecision, setLastDecision] = useState<{ positive: boolean; text: string } | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const logRef = useRef<HTMLDivElement>(null);

  const preloadImage = (src: string) => {
    const img = new Image();
    img.onload = () => setImageLoaded(prev => ({ ...prev, [src]: true }));
    img.src = src;
  };

  useEffect(() => {
    // Preload key images
    [SHOP_IMAGE, FOREST_BG, FINAL_GREEN, KUNDUZ_IMAGE, OWL_IMAGE, ...customers.map(c => c.image)].forEach(preloadImage);
  }, []);

  const startGame = () => {
    setGame({ ...INITIAL_STATE, phase: 'dayStart' });
  };

  const nextIntroStep = () => {
    if (game.introStep < storyIntro.length - 1) {
      setGame(prev => ({ ...prev, introStep: prev.introStep + 1 }));
    } else {
      startGame();
    }
  };

  const startDay = () => {
    const weather = getRandomWeather(game.day);
    const numCustomers = game.day <= 3 ? 2 : game.day <= 7 ? 3 : 2;
    const customersToday = getRandomCustomers(numCustomers);
    
    setGame(prev => ({
      ...prev,
      phase: 'customerDecision',
      weather,
      customersToday,
      currentCustomerIndex: 0,
      dayLog: [`📅 Gün ${prev.day} başladı. Hava: ${weather.emoji} ${weather.name}`]
    }));
  };

  const makeDecision = useCallback((option: DecisionOption, customer: Customer) => {
    setAnimating(true);
    
    const carbonMultiplier = game.weather.carbonMultiplier;
    const moneyMultiplier = game.weather.moneyMultiplier;
    
    const actualCarbon = Math.round(option.carbonChange * carbonMultiplier);
    const actualMoney = Math.round(option.moneyChange * moneyMultiplier);
    
    const treeReduction = game.trees * 2;
    const finalCarbon = actualCarbon > 0 ? Math.max(0, actualCarbon - treeReduction) : actualCarbon;

    const isPositive = actualMoney > 0 && finalCarbon <= 5;
    const feedbackText = isPositive 
      ? "Harika bir denge kurdun!" 
      : actualMoney > 30 && finalCarbon > 15 
        ? "Kasan doldu ama çuvalın ağırlaşıyor..." 
        : actualMoney <= 0 && finalCarbon < 0
          ? "Orman sana teşekkür ediyor."
          : "Her karar bir denge gerektirir.";

    setLastDecision({ positive: isPositive, text: feedbackText });

    const newLog = [
      ...game.dayLog,
      `${customer.emoji} ${customer.name}: ${option.label}`,
      `  💰 ${actualMoney > 0 ? '+' : ''}${actualMoney} | 🌫️ ${finalCarbon > 0 ? '+' : ''}${finalCarbon} | 😊 ${option.satisfactionChange > 0 ? '+' : ''}${option.satisfactionChange}`
    ];

    const newTrees = option.id === 'accept' && customer.id === 'squirrel' ? game.trees + 1 : 
             option.id === 'alternative' && customer.id === 'bear' ? game.trees + 1 : 
             option.id === 'accept' && customer.id === 'owl_teacher' ? game.trees + 1 : game.trees;

    setGame(prev => ({
      ...prev,
      money: prev.money + actualMoney,
      carbon: Math.max(0, prev.carbon + finalCarbon),
      satisfaction: Math.max(0, Math.min(100, prev.satisfaction + option.satisfactionChange)),
      trees: newTrees,
      decisionsMade: [...prev.decisionsMade, { 
        day: prev.day, customer: customer.id, customerName: customer.name,
        customerEmoji: customer.emoji, choice: option.id, choiceLabel: option.label,
        moneyChange: actualMoney, carbonChange: finalCarbon, satisfactionChange: option.satisfactionChange
      }],
      dayLog: newLog
    }));

    setTimeout(() => {
      setAnimating(false);
      setLastDecision(null);
      setShowOwlTip(Math.random() > 0.5);
      
      setGame(prev => {
        const nextIndex = prev.currentCustomerIndex + 1;
        if (nextIndex >= prev.customersToday.length) {
          return { ...prev, phase: 'dayEnd', currentCustomerIndex: nextIndex };
        }
        return { ...prev, currentCustomerIndex: nextIndex };
      });
    }, 1200);
  }, [game.weather.carbonMultiplier, game.weather.moneyMultiplier, game.dayLog, game.trees]);

  const endDay = () => {
    const dailyPayment = 100;
    const canPay = game.money >= dailyPayment;
    const newFailedPayments = canPay ? game.failedPayments : game.failedPayments + 1;
    
    setGame(prev => {
      const newMoney = canPay ? prev.money - dailyPayment : prev.money;
      const newDay = prev.day + 1;
      const newCarbonHistory = [...prev.carbonHistory, prev.carbon];
      const newMoneyHistory = [...prev.moneyHistory, newMoney];
      
      if (newFailedPayments >= 3 || prev.carbon >= 100 || prev.satisfaction <= 0 || newDay > 10) {
        return { ...prev, phase: 'final', money: newMoney, failedPayments: newFailedPayments, carbonHistory: newCarbonHistory, moneyHistory: newMoneyHistory };
      }
      
      return {
        ...prev, day: newDay, money: newMoney, failedPayments: newFailedPayments,
        phase: 'dayStart', dayLog: [], carbonHistory: newCarbonHistory, moneyHistory: newMoneyHistory
      };
    });
  };

  const restartGame = () => {
    setGame(INITIAL_STATE);
    setLastDecision(null);
    setShowOwlTip(false);
  };

  const getEnding = () => {
    if (game.failedPayments >= 3 || game.carbon >= 100 || game.satisfaction <= 0) return endings.closed;
    if (game.money >= 200 && game.carbon < 50) return endings.green;
    if (game.money >= 200) return endings.gold;
    return endings.closed;
  };

  useEffect(() => {
    if (showOwlTip) {
      const timer = setTimeout(() => setShowOwlTip(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showOwlTip]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [game.dayLog]);

  // =================== INTRO SCREEN ===================
  const renderIntro = () => (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={FOREST_BG} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-green-950/70 to-black/80" />
      </div>
      
      <Particles type="fireflies" />
      <Particles type="leaves" />
      
      <div className="max-w-3xl w-full relative z-10">
        {/* Title */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="relative inline-block">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-2xl tracking-tight">
              Çuval Yasası
            </h1>
            <div className="absolute -inset-2 bg-amber-400/10 blur-xl rounded-full" />
          </div>
          <p className="text-green-200/90 text-lg md:text-xl mt-3 font-light italic tracking-wide">
            Bir Dükkânın, Bir Dünyanın Hikâyesi
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-green-300/70">
            <span className="flex items-center gap-1">🎮 Hikâye</span>
            <span className="text-amber-400">•</span>
            <span className="flex items-center gap-1">🧠 Strateji</span>
            <span className="text-amber-400">•</span>
            <span className="flex items-center gap-1">🌱 Sürdürülebilirlik</span>
          </div>
        </div>
        
        {/* Story card */}
        <DialogBox>
          <div className="text-center mb-6">
            <span className="text-6xl mb-4 block animate-float">{storyIntro[game.introStep].emoji}</span>
            <h2 className="text-2xl md:text-3xl font-bold text-amber-200 mb-4 tracking-wide">
              {storyIntro[game.introStep].title}
            </h2>
            <p className="text-green-100/90 text-lg leading-relaxed">
              {storyIntro[game.introStep].text}
            </p>
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-2">
              {storyIntro.map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  i === game.introStep ? 'bg-amber-400 scale-125 shadow-lg shadow-amber-400/50' : 
                  i < game.introStep ? 'bg-green-400/80' : 'bg-gray-600/50'
                }`} />
              ))}
            </div>
            <button
              onClick={nextIntroStep}
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-600/30 border border-amber-400/30"
            >
              {game.introStep < storyIntro.length - 1 ? 'Devam →' : '🎮 Oyuna Başla'}
            </button>
          </div>
        </DialogBox>
        
        <button onClick={startGame} className="mt-4 mx-auto block text-green-300/60 hover:text-green-200 text-sm underline underline-offset-4 transition-colors">
          Girişi atla →
        </button>
      </div>
    </div>
  );

  // =================== DAY START SCREEN ===================
  const renderDayStart = () => {
    const event = dailyEvents[game.day - 1];
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={SHOP_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-green-950/60 to-black/80" />
        </div>
        
        <Particles type="fireflies" />
        
        <div className="max-w-2xl w-full relative z-10">
          <StatusBar game={game} />
          
          <DialogBox>
            <div className="text-center animate-fadeIn">
              <span className="text-6xl mb-4 block animate-float">{event.emoji}</span>
              <div className="inline-block px-4 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full mb-3">
                <span className="text-amber-300 text-sm font-medium">Gün {game.day}/10</span>
              </div>
              <h2 className="text-3xl font-bold text-amber-200 mb-3">{event.title}</h2>
              <p className="text-green-100/90 text-lg leading-relaxed mb-6">{event.text}</p>
              
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <div className="text-xs text-green-400/70">💰 Kasa</div>
                  <div className={`text-lg font-bold ${game.money >= 100 ? 'text-amber-200' : 'text-red-400'}`}>{game.money}</div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <div className="text-xs text-green-400/70">🌫️ Çuval</div>
                  <div className={`text-lg font-bold ${game.carbon < 50 ? 'text-green-300' : 'text-red-400'}`}>{game.carbon}/100</div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <div className="text-xs text-green-400/70">😊 Güven</div>
                  <div className={`text-lg font-bold ${game.satisfaction > 50 ? 'text-amber-200' : 'text-red-400'}`}>{game.satisfaction}</div>
                </div>
              </div>

              {game.failedPayments > 0 && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-2 mb-4">
                  <p className="text-red-300 text-sm">⚠️ Ödenemeyen gün: {game.failedPayments}/3</p>
                </div>
              )}

              <button
                onClick={startDay}
                className="px-10 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-600/30 text-lg border border-amber-400/30"
              >
                🏪 Dükkânı Aç
              </button>
            </div>
          </DialogBox>
        </div>
      </div>
    );
  };

  // =================== CUSTOMER DECISION SCREEN ===================
  const renderCustomerDecision = () => {
    const customer = game.customersToday[game.currentCustomerIndex];
    if (!customer) return null;

    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={SHOP_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-green-950/60 to-black/80" />
        </div>
        
        <Particles type="fireflies" />
        
        <div className="max-w-2xl w-full relative z-10">
          <StatusBar game={game} />
          
          {/* Owl tip popup */}
          {showOwlTip && (
            <div className="fixed top-4 right-4 z-50 animate-slideIn max-w-xs">
              <div className="relative">
                <img src={OWL_IMAGE} alt="" className="w-16 h-16 rounded-full border-2 border-purple-400/50 object-cover absolute -top-8 left-4 shadow-xl" />
                <div className="bg-purple-950/95 backdrop-blur-md border border-purple-400/40 rounded-xl p-4 pt-4 ml-8 shadow-2xl">
                  <p className="text-purple-200 text-sm italic">
                    🦉 {owlWisdom[Math.floor(Math.random() * owlWisdom.length)]}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Decision feedback */}
          {lastDecision && (
            <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fadeIn`}>
              <div className={`rounded-xl px-6 py-3 shadow-2xl border ${
                lastDecision.positive 
                  ? 'bg-green-950/95 border-green-400/50' 
                  : 'bg-amber-950/95 border-amber-400/50'
              }`}>
                <p className={`text-sm font-bold ${lastDecision.positive ? 'text-green-200' : 'text-amber-200'}`}>
                  {lastDecision.positive ? '✨' : '⚡'} {lastDecision.text}
                </p>
              </div>
            </div>
          )}

          <DialogBox>
            {/* Progress */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-green-300/80 text-sm bg-black/30 rounded-full px-3 py-1 border border-white/5">
                Müşteri {game.currentCustomerIndex + 1}/{game.customersToday.length}
              </span>
              <div className="flex gap-1.5">
                {game.customersToday.map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full transition-all ${
                    i < game.currentCustomerIndex ? 'bg-green-400 shadow-sm shadow-green-400/50' : 
                    i === game.currentCustomerIndex ? 'bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50' : 'bg-gray-600/50'
                  }`} />
                ))}
              </div>
            </div>

            {/* Customer portrait */}
            <div className="text-center mb-6 relative">
              <div className="relative inline-block">
                {/* Anime-style portrait frame */}
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-400/30 to-green-600/30 blur-lg" />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-amber-400/50 shadow-2xl">
                    <img 
                      src={customer.image} 
                      alt={customer.name}
                      className={`w-full h-full object-cover transition-all duration-500 ${animating ? 'scale-110 brightness-150' : 'scale-100'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  {/* Decorative ring */}
                  <div className="absolute -inset-2 rounded-full border border-amber-400/20 animate-spin-slow" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-amber-200 mb-2">{customer.name} {customer.emoji}</h3>
              
              {/* Speech bubble */}
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 mx-4 border border-white/10">
                <p className="text-green-100 text-lg italic">"{customer.request}"</p>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/10 border-r border-b border-white/10 rotate-45" />
              </div>
              
              <p className="text-green-300/70 text-sm mt-3">{customer.description}</p>
            </div>

            {/* Decision options */}
            <div className="space-y-3">
              {customer.options.map((option) => {
                const isHighCarbon = option.carbonChange > 15;
                const isEcoFriendly = option.carbonChange < 0;
                const isBalanced = !isHighCarbon && !isEcoFriendly && option.moneyChange > 0;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => !animating && makeDecision(option, customer)}
                    disabled={animating}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group ${
                      animating
                        ? 'opacity-50 cursor-not-allowed bg-gray-800/50 border-gray-600/30'
                        : isHighCarbon
                          ? 'bg-gradient-to-r from-red-950/50 to-red-900/30 border-red-500/30 hover:border-red-400/60 hover:shadow-lg hover:shadow-red-900/30'
                          : isEcoFriendly
                            ? 'bg-gradient-to-r from-green-950/50 to-green-900/30 border-green-500/30 hover:border-green-400/60 hover:shadow-lg hover:shadow-green-900/30'
                            : 'bg-gradient-to-r from-amber-950/40 to-amber-900/20 border-amber-500/20 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-900/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {isHighCarbon && <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30">⚠️ YÜKSEK KARBON</span>}
                          {isEcoFriendly && <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30">🌱 DOĞAL</span>}
                          {isBalanced && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">⚖️ DENGE</span>}
                        </div>
                        <h4 className="text-amber-100 font-bold group-hover:text-amber-50 transition-colors">{option.label}</h4>
                        <p className="text-green-300/60 text-sm mt-0.5">{option.description}</p>
                      </div>
                      <div className="text-green-400/50 group-hover:text-amber-300 transition-colors text-xl">→</div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${option.moneyChange > 0 ? 'bg-green-900/50 text-green-300 border border-green-500/20' : option.moneyChange < 0 ? 'bg-red-900/50 text-red-300 border border-red-500/20' : 'bg-gray-800/50 text-gray-400 border border-gray-600/20'}`}>
                        💰 {option.moneyChange > 0 ? '+' : ''}{option.moneyChange}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${option.carbonChange > 0 ? 'bg-red-900/50 text-red-300 border border-red-500/20' : option.carbonChange < 0 ? 'bg-green-900/50 text-green-300 border border-green-500/20' : 'bg-gray-800/50 text-gray-400 border border-gray-600/20'}`}>
                        🌫️ {option.carbonChange > 0 ? '+' : ''}{option.carbonChange}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${option.satisfactionChange > 0 ? 'bg-blue-900/50 text-blue-300 border border-blue-500/20' : option.satisfactionChange < 0 ? 'bg-red-900/50 text-red-300 border border-red-500/20' : 'bg-gray-800/50 text-gray-400 border border-gray-600/20'}`}>
                        😊 {option.satisfactionChange > 0 ? '+' : ''}{option.satisfactionChange}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </DialogBox>
        </div>
      </div>
    );
  };

  // =================== DAY END SCREEN ===================
  const renderDayEnd = () => (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0">
        <img src={SHOP_IMAGE} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-indigo-950/60 to-black/80" />
      </div>
      
      <Particles type="fireflies" />
      
      <div className="max-w-2xl w-full relative z-10">
        <StatusBar game={game} />
        
        <DialogBox>
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-amber-200 text-center mb-4 flex items-center justify-center gap-2">
              📒 <span>Gün {game.day} Defteri</span>
            </h2>
            
            <div ref={logRef} className="bg-black/40 rounded-xl p-4 mb-4 max-h-36 overflow-y-auto border border-white/5 font-mono text-sm">
              {game.dayLog.map((log, i) => (
                <p key={i} className={`mb-1 ${log.startsWith('  ') ? 'text-green-300/70 pl-4 text-xs' : 'text-amber-200/90 font-medium'}`}>
                  {log}
                </p>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/30 rounded-lg p-3 text-center border border-white/5">
                <div className="text-xs text-green-300/70 mb-1">Günlük Ödeme</div>
                <div className={`text-lg font-bold ${game.money >= 100 ? 'text-green-400' : 'text-red-400 animate-pulse'}`}>
                  {game.money >= 100 ? '✅ Ödenebilir' : '❌ Ödenemez!'}
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center border border-white/5">
                <div className="text-xs text-green-300/70 mb-1">Ödeme Sonrası</div>
                <div className={`text-lg font-bold ${game.money - 100 >= 0 ? 'text-amber-200' : 'text-red-400'}`}>
                  {game.money - (game.money >= 100 ? 100 : 0)} 💰
                </div>
              </div>
            </div>

            {game.failedPayments > 0 && (
              <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 mb-4 text-center">
                <p className="text-red-300 text-sm">
                  ⚠️ Ödenemeyen gün: <span className="font-bold">{game.failedPayments}/3</span>
                  {game.failedPayments >= 2 && <span className="block text-red-400 font-bold mt-1">🚨 Son şans!</span>}
                </p>
              </div>
            )}

            {game.carbon >= 70 && (
              <div className="bg-orange-950/40 border border-orange-500/30 rounded-xl p-3 mb-4 text-center">
                <p className="text-orange-300 text-sm">🌫️ <span className="font-bold">Çuvalın çok dolu!</span> Karbon {game.carbon}/100</p>
              </div>
            )}

            {game.trees > 0 && (
              <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-3 mb-4 text-center">
                <p className="text-green-300 text-sm">🌱 {game.trees} fidanın her gün {game.trees * 2} karbon emiyor!</p>
              </div>
            )}

            <button
              onClick={endDay}
              className="w-full px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-600/30 text-lg border border-amber-400/30"
            >
              {game.day >= 10 ? '🏁 Sonuçları Gör' : '🌙 Geceyi Geçir'}
            </button>
          </div>
        </DialogBox>
      </div>
    </div>
  );

  // =================== FINAL SCREEN ===================
  const renderFinal = () => {
    const ending = getEnding();
    const isGreen = ending.subtitle === 'Final A';
    const isGold = ending.subtitle === 'Final B';
    const bgImage = isGreen ? FINAL_GREEN : FOREST_BG;
    
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={bgImage} alt="" className="w-full h-full object-cover" />
          <div className={`absolute inset-0 ${
            isGreen ? 'bg-gradient-to-b from-green-950/60 via-emerald-900/50 to-green-950/70' :
            isGold ? 'bg-gradient-to-b from-amber-950/70 via-yellow-900/60 to-amber-950/80' :
            'bg-gradient-to-b from-gray-950/80 via-slate-900/70 to-gray-950/90'
          }`} />
        </div>
        
        {isGreen && <Particles type="sparkle" />}
        {isGreen && <Particles type="leaves" />}
        
        <div className="max-w-2xl w-full relative z-10">
          <DialogBox variant={isGreen ? 'success' : isGold ? 'default' : 'warning'}>
            <div className="text-center animate-fadeIn">
              <span className="text-7xl mb-4 block animate-float">{ending.emoji}</span>
              <div className="inline-block px-4 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full mb-3">
                <span className="text-amber-300 text-sm font-medium">{ending.subtitle}</span>
              </div>
              <h2 className="text-3xl font-bold text-amber-200 mb-4">{ending.title}</h2>
              <p className="text-green-100/90 text-lg leading-relaxed mb-6">{ending.text}</p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                  <div className="text-xs text-green-300/70">💰 Para</div>
                  <div className="text-2xl font-bold text-amber-200">{game.money}</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                  <div className="text-xs text-green-300/70">🌫️ Karbon</div>
                  <div className={`text-2xl font-bold ${game.carbon < 50 ? 'text-green-300' : 'text-red-400'}`}>{game.carbon}</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                  <div className="text-xs text-green-300/70">😊 Memnuniyet</div>
                  <div className="text-2xl font-bold text-amber-200">{game.satisfaction}</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                  <div className="text-xs text-green-300/70">🌱 Fidan</div>
                  <div className="text-2xl font-bold text-green-300">{game.trees}</div>
                </div>
              </div>

              {/* Chart */}
              {game.carbonHistory.length > 1 && (
                <div className="bg-black/20 rounded-xl p-4 mb-4 border border-white/5">
                  <h4 className="text-sm text-green-300/80 mb-3 font-medium">📊 Karbon Seyri</h4>
                  <div className="flex items-end gap-1 h-16">
                    {game.carbonHistory.map((c, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full rounded-t transition-all duration-500"
                          style={{ 
                            height: `${Math.max(4, (c / Math.max(...game.carbonHistory, 1)) * 56)}px`,
                            backgroundColor: c > 70 ? '#ef4444' : c > 40 ? '#eab308' : '#22c55e'
                          }}
                        />
                        <span className="text-[8px] text-green-500/50 mt-1">{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision summary */}
              {game.decisionsMade.length > 0 && (
                <div className="bg-black/20 rounded-xl p-4 mb-4 text-left border border-white/5">
                  <h4 className="text-sm text-amber-200 font-bold mb-2 text-center">📋 Kararların</h4>
                  <div className="max-h-28 overflow-y-auto space-y-1">
                    {game.decisionsMade.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-green-200/80 border-b border-white/5 pb-1">
                        <span>{d.customerEmoji}</span>
                        <span className="flex-1 truncate">{d.choiceLabel}</span>
                        <span className={`${d.moneyChange > 0 ? 'text-green-400' : 'text-red-400'}`}>💰{d.moneyChange > 0 ? '+' : ''}{d.moneyChange}</span>
                        <span className={`${d.carbonChange > 0 ? 'text-red-400' : 'text-green-400'}`}>🌫️{d.carbonChange > 0 ? '+' : ''}{d.carbonChange}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Owl's message */}
              <div className="bg-purple-950/40 border border-purple-400/30 rounded-xl p-4 mb-6 relative">
                <img src={OWL_IMAGE} alt="" className="w-12 h-12 rounded-full border-2 border-purple-400/50 object-cover absolute -top-6 left-4 shadow-xl" />
                <p className="text-purple-300/80 text-xs mb-2 mt-2 font-medium">Öğretmen Baykuş'un son notu:</p>
                <p className="text-purple-100/90 text-sm leading-relaxed italic">
                  "Bir çuvalı doldurmak kolaydır. Zor olan, içindeki yükü kimin taşıdığını fark etmektir. 
                  Her kararın bir bedeli vardır; kimi bugün ödenir, kimi yarına kalır. 
                  Peki sen, kazandıklarını sayarken geride ne bıraktın?"
                </p>
              </div>

              {/* Reflection */}
              <div className="bg-black/20 rounded-xl p-4 mb-6 text-left border border-white/5">
                <h3 className="text-amber-200 font-bold mb-3 text-center text-sm">🤔 Düşünme Soruları</h3>
                <ol className="space-y-2 text-green-200/80 text-sm list-decimal list-inside">
                  <li>Gerçek hayatta hangi tüketim alışkanlığını değiştirebilirsin?</li>
                  <li>Kısa vadeli kazanç ile uzun vadeli fayda çatıştığında nasıl karar verirsin?</li>
                  <li>Bir bireyin küçük kararları, ortak bir çevre sorununu çözmeye nasıl katkıda bulunabilir?</li>
                </ol>
              </div>

              <button
                onClick={restartGame}
                className="w-full px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-600/30 text-lg border border-amber-400/30"
              >
                🔄 Tekrar Oyna
              </button>
            </div>
          </DialogBox>
        </div>
      </div>
    );
  };

  switch (game.phase) {
    case 'intro': return renderIntro();
    case 'dayStart': return renderDayStart();
    case 'customerDecision': return renderCustomerDecision();
    case 'dayEnd': return renderDayEnd();
    case 'final': return renderFinal();
    default: return renderIntro();
  }
}

export default App;
