import { useState, useEffect, useCallback, useRef } from 'react';
import {
  customers,
  dailyEvents,
  weatherEvents,
  storyIntro,
  endings,
  owlWisdom,
  Customer,
  DecisionOption,
  WeatherEvent
} from './data/gameData';

type GamePhase = 'intro' | 'playing' | 'dayStart' | 'customerDecision' | 'dayEnd' | 'final';

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
  const shuffled = shuffleArray(customers);
  return shuffled.slice(0, count);
}

function getRandomWeather(day: number): WeatherEvent {
  if (day <= 2) return weatherEvents[0];
  if (day >= 7) {
    const extreme = weatherEvents.filter(w => w.id !== 'normal');
    return extreme[Math.floor(Math.random() * extreme.length)];
  }
  return weatherEvents[Math.floor(Math.random() * weatherEvents.length)];
}

// Floating leaf component
function FloatingLeaf({ delay, left }: { delay: number; left: number }) {
  return (
    <div
      className="absolute text-2xl opacity-20 pointer-events-none animate-float"
      style={{
        left: `${left}%`,
        top: `${10 + Math.random() * 60}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${3 + Math.random() * 4}s`
      }}
    >
      🍃
    </div>
  );
}

function App() {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);
  const [animating, setAnimating] = useState(false);
  const [showOwlTip, setShowOwlTip] = useState(false);
  const [lastDecision, setLastDecision] = useState<{ positive: boolean; text: string } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

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
      ? "Harika bir denge kurduğun!" 
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
        day: prev.day, 
        customer: customer.id, 
        customerName: customer.name,
        customerEmoji: customer.emoji,
        choice: option.id, 
        choiceLabel: option.label,
        moneyChange: actualMoney,
        carbonChange: finalCarbon,
        satisfactionChange: option.satisfactionChange
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
      
      if (newFailedPayments >= 3) {
        return { ...prev, phase: 'final', money: newMoney, failedPayments: newFailedPayments, carbonHistory: newCarbonHistory, moneyHistory: newMoneyHistory };
      }
      if (prev.carbon >= 100) {
        return { ...prev, phase: 'final', money: newMoney, failedPayments: newFailedPayments, carbonHistory: newCarbonHistory, moneyHistory: newMoneyHistory };
      }
      if (prev.satisfaction <= 0) {
        return { ...prev, phase: 'final', money: newMoney, failedPayments: newFailedPayments, carbonHistory: newCarbonHistory, moneyHistory: newMoneyHistory };
      }
      if (newDay > 10) {
        return { ...prev, phase: 'final', money: newMoney, failedPayments: newFailedPayments, carbonHistory: newCarbonHistory, moneyHistory: newMoneyHistory };
      }
      
      return {
        ...prev,
        day: newDay,
        money: newMoney,
        failedPayments: newFailedPayments,
        phase: 'dayStart',
        dayLog: [],
        carbonHistory: newCarbonHistory,
        moneyHistory: newMoneyHistory
      };
    });
  };

  const restartGame = () => {
    setGame(INITIAL_STATE);
    setLastDecision(null);
    setShowOwlTip(false);
  };

  const getEnding = () => {
    if (game.failedPayments >= 3 || game.carbon >= 100 || game.satisfaction <= 0) {
      return endings.closed;
    }
    if (game.money >= 200 && game.carbon < 50) {
      return endings.green;
    }
    if (game.money >= 200) {
      return endings.gold;
    }
    return endings.closed;
  };

  useEffect(() => {
    if (showOwlTip) {
      const timer = setTimeout(() => setShowOwlTip(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showOwlTip]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [game.dayLog]);

  // RENDER FUNCTIONS
  const renderIntro = () => (
    <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating leaves background */}
      {Array.from({ length: 12 }).map((_, i) => (
        <FloatingLeaf key={i} delay={i * 0.5} left={5 + i * 8} />
      ))}
      
      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="text-6xl mb-4 animate-float">🌳</div>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-200 mb-2 drop-shadow-lg">
            Çuval Yasası
          </h1>
          <p className="text-green-200 text-lg italic">Bir Dükkânın, Bir Dünyanın Hikâyesi</p>
          <div className="mt-2 flex justify-center gap-2 text-sm text-green-400">
            <span>🎮 Hikâye</span>
            <span>•</span>
            <span>🧠 Strateji</span>
            <span>•</span>
            <span>🌱 Sürdürülebilirlik</span>
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-green-500/20 shadow-2xl animate-fadeIn">
          <div className="text-center mb-6">
            <span className="text-6xl mb-4 block">{storyIntro[game.introStep].emoji}</span>
            <h2 className="text-2xl font-bold text-amber-100 mb-4">
              {storyIntro[game.introStep].title}
            </h2>
          </div>
          <p className="text-green-100 text-lg leading-relaxed text-center mb-8">
            {storyIntro[game.introStep].text}
          </p>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {storyIntro.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i === game.introStep ? 'bg-amber-400 scale-125 shadow-lg shadow-amber-400/50' : 
                    i < game.introStep ? 'bg-green-400' : 'bg-green-800'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextIntroStep}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-600/30"
            >
              {game.introStep < storyIntro.length - 1 ? 'Devam →' : '🎮 Oyuna Başla'}
            </button>
          </div>
        </div>
        
        <button
          onClick={startGame}
          className="mt-4 mx-auto block text-green-400 hover:text-green-200 text-sm underline underline-offset-4 transition-colors"
        >
          Girişi atla →
        </button>
      </div>
    </div>
  );

  const renderStatusBar = () => (
    <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-green-600/20 mb-4 shadow-lg">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="text-center bg-black/20 rounded-lg p-2">
          <div className="text-xs text-green-300 mb-1">📅 Gün</div>
          <div className="text-xl font-bold text-amber-200">{game.day}<span className="text-sm text-green-400">/10</span></div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
            <div className="h-1 rounded-full bg-amber-500 transition-all" style={{ width: `${game.day * 10}%` }} />
          </div>
        </div>
        <div className="text-center bg-black/20 rounded-lg p-2">
          <div className="text-xs text-green-300 mb-1">💰 Para</div>
          <div className={`text-xl font-bold ${game.money < 100 ? 'text-red-400 animate-pulse' : 'text-amber-200'}`}>
            {game.money}
          </div>
          <div className="text-xs text-green-500 mt-1">Günlük: -100</div>
        </div>
        <div className="text-center bg-black/20 rounded-lg p-2">
          <div className="text-xs text-green-300 mb-1">🌫️ Karbon</div>
          <div className={`text-xl font-bold ${game.carbon > 70 ? 'text-red-400 animate-pulse' : game.carbon > 40 ? 'text-yellow-300' : 'text-green-300'}`}>
            {game.carbon}<span className="text-sm text-green-500">/100</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${game.carbon > 70 ? 'bg-red-500' : game.carbon > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(100, game.carbon)}%` }}
            />
          </div>
        </div>
        <div className="text-center bg-black/20 rounded-lg p-2">
          <div className="text-xs text-green-300 mb-1">😊 Memnuniyet</div>
          <div className={`text-xl font-bold ${game.satisfaction < 30 ? 'text-red-400' : 'text-amber-200'}`}>
            {game.satisfaction}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
            <div className="h-1 rounded-full bg-blue-400 transition-all" style={{ width: `${game.satisfaction}%` }} />
          </div>
        </div>
        <div className="text-center bg-black/20 rounded-lg p-2">
          <div className="text-xs text-green-300 mb-1">🌱 Fidanlar</div>
          <div className="text-xl font-bold text-green-300">{game.trees}</div>
          <div className="text-xs text-green-500 mt-1">-{game.trees * 2} karbon/gün</div>
        </div>
      </div>
      {game.weather.id !== 'normal' && (
        <div className="mt-3 text-center text-sm bg-black/30 rounded-lg py-2 px-3 border border-amber-600/20">
          <span className="text-amber-300 font-medium">{game.weather.emoji} {game.weather.name}:</span>
          <span className="text-green-200 ml-2">{game.weather.description}</span>
        </div>
      )}
    </div>
  );

  const renderDayStart = () => {
    const event = dailyEvents[game.day - 1];
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <FloatingLeaf key={i} delay={i * 0.7} left={10 + i * 10} />
        ))}
        
        <div className="max-w-2xl w-full relative z-10">
          {renderStatusBar()}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-green-500/20 shadow-2xl text-center animate-fadeIn">
            <span className="text-6xl mb-4 block animate-float">{event.emoji}</span>
            <h2 className="text-3xl font-bold text-amber-200 mb-2">{event.title}</h2>
            <p className="text-green-100 text-lg leading-relaxed mb-6">{event.text}</p>
            
            <div className="bg-black/20 rounded-lg p-4 mb-6 border border-green-600/20">
              <div className="flex justify-center gap-6 text-sm">
                <div>
                  <span className="text-green-400">💰 Kasa:</span>
                  <span className={`ml-2 font-bold ${game.money >= 100 ? 'text-amber-200' : 'text-red-400'}`}>{game.money}</span>
                </div>
                <div>
                  <span className="text-green-400">🌫️ Çuval:</span>
                  <span className={`ml-2 font-bold ${game.carbon < 50 ? 'text-green-300' : 'text-red-400'}`}>{game.carbon}/100</span>
                </div>
                <div>
                  <span className="text-green-400">😊 Güven:</span>
                  <span className={`ml-2 font-bold ${game.satisfaction > 50 ? 'text-amber-200' : 'text-red-400'}`}>{game.satisfaction}</span>
                </div>
              </div>
              {game.failedPayments > 0 && (
                <p className="text-red-400 text-xs mt-2">⚠️ Ödenemeyen gün: {game.failedPayments}/3</p>
              )}
            </div>

            <button
              onClick={startDay}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-600/30 text-lg"
            >
              🏪 Dükkânı Aç
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomerDecision = () => {
    const customer = game.customersToday[game.currentCustomerIndex];
    if (!customer) return null;

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <FloatingLeaf key={i} delay={i * 0.8} left={15 + i * 12} />
        ))}
        
        <div className="max-w-2xl w-full relative z-10">
          {renderStatusBar()}
          
          {/* Owl tip popup */}
          {showOwlTip && (
            <div className="fixed top-4 right-4 bg-purple-900/95 backdrop-blur-sm border border-purple-400/40 rounded-xl p-4 max-w-xs z-50 animate-slideIn shadow-xl">
              <p className="text-purple-200 text-sm italic">
                🦉 {owlWisdom[Math.floor(Math.random() * owlWisdom.length)]}
              </p>
            </div>
          )}

          {/* Last decision feedback */}
          {lastDecision && (
            <div className={`fixed top-4 left-1/2 -translate-x-1/2 rounded-xl p-3 z-50 animate-fadeIn shadow-xl ${
              lastDecision.positive ? 'bg-green-900/95 border border-green-400/40' : 'bg-amber-900/95 border border-amber-400/40'
            }`}>
              <p className={`text-sm font-medium ${lastDecision.positive ? 'text-green-200' : 'text-amber-200'}`}>
                {lastDecision.text}
              </p>
            </div>
          )}

          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-green-500/20 shadow-2xl animate-fadeIn">
            {/* Progress bar */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-green-300 text-sm bg-black/20 rounded-full px-3 py-1">
                Müşteri {game.currentCustomerIndex + 1}/{game.customersToday.length}
              </span>
              <div className="flex gap-1">
                {game.customersToday.map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full ${
                    i < game.currentCustomerIndex ? 'bg-green-400' : 
                    i === game.currentCustomerIndex ? 'bg-amber-400 animate-pulse' : 'bg-gray-600'
                  }`} />
                ))}
              </div>
            </div>

            {/* Customer card */}
            <div className="text-center mb-6 bg-black/20 rounded-xl p-6 border border-green-600/10">
              <span className={`text-7xl mb-3 block ${animating ? 'animate-bounce' : 'animate-float'}`}>{customer.emoji}</span>
              <h3 className="text-2xl font-bold text-amber-200 mb-2">{customer.name}</h3>
              <div className="bg-black/30 rounded-lg p-3 mb-3">
                <p className="text-green-200 text-lg italic">"{customer.request}"</p>
              </div>
              <p className="text-green-300 text-sm">{customer.description}</p>
            </div>

            {/* Options */}
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
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                      animating
                        ? 'opacity-50 cursor-not-allowed bg-gray-800/50 border-gray-600'
                        : isHighCarbon
                          ? 'bg-red-950/40 border-red-600/30 hover:bg-red-900/50 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-900/20'
                          : isEcoFriendly
                            ? 'bg-green-950/40 border-green-600/30 hover:bg-green-900/50 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-900/20'
                            : 'bg-amber-950/30 border-amber-600/20 hover:bg-amber-900/40 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-900/20'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h4 className="text-amber-100 font-bold mb-1 flex items-center gap-2">
                          {isHighCarbon && <span className="text-xs bg-red-800/50 text-red-300 px-2 py-0.5 rounded-full">Yüksek Karbon</span>}
                          {isEcoFriendly && <span className="text-xs bg-green-800/50 text-green-300 px-2 py-0.5 rounded-full">🌱 Doğal</span>}
                          {isBalanced && <span className="text-xs bg-amber-800/50 text-amber-300 px-2 py-0.5 rounded-full">Dengeli</span>}
                          {option.label}
                        </h4>
                        <p className="text-green-300 text-sm opacity-80">{option.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs font-medium">
                      <span className={`px-2 py-1 rounded-md ${option.moneyChange > 0 ? 'bg-green-900/40 text-green-300' : option.moneyChange < 0 ? 'bg-red-900/40 text-red-300' : 'bg-gray-800/40 text-gray-400'}`}>
                        💰 {option.moneyChange > 0 ? '+' : ''}{option.moneyChange}
                      </span>
                      <span className={`px-2 py-1 rounded-md ${option.carbonChange > 0 ? 'bg-red-900/40 text-red-300' : option.carbonChange < 0 ? 'bg-green-900/40 text-green-300' : 'bg-gray-800/40 text-gray-400'}`}>
                        🌫️ {option.carbonChange > 0 ? '+' : ''}{option.carbonChange}
                      </span>
                      <span className={`px-2 py-1 rounded-md ${option.satisfactionChange > 0 ? 'bg-blue-900/40 text-blue-300' : option.satisfactionChange < 0 ? 'bg-red-900/40 text-red-300' : 'bg-gray-800/40 text-gray-400'}`}>
                        😊 {option.satisfactionChange > 0 ? '+' : ''}{option.satisfactionChange}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDayEnd = () => (
    <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <FloatingLeaf key={i} delay={i * 0.6} left={10 + i * 15} />
      ))}
      
      <div className="max-w-2xl w-full relative z-10">
        {renderStatusBar()}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-green-500/20 shadow-2xl animate-fadeIn">
          <h2 className="text-2xl font-bold text-amber-200 text-center mb-4 flex items-center justify-center gap-2">
            📒 <span>Gün {game.day} Defteri</span>
          </h2>
          
          <div ref={logRef} className="bg-black/30 rounded-xl p-4 mb-4 max-h-40 overflow-y-auto border border-green-800/20">
            {game.dayLog.map((log, i) => (
              <p key={i} className={`text-sm mb-1 ${log.startsWith('  ') ? 'text-green-300 pl-4' : 'text-amber-200 font-medium'}`}>
                {log}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-black/20 rounded-lg p-3 text-center border border-green-800/20">
              <div className="text-xs text-green-300 mb-1">Günlük Ödeme</div>
              <div className={`text-lg font-bold ${game.money >= 100 ? 'text-green-400' : 'text-red-400 animate-pulse'}`}>
                {game.money >= 100 ? '✅ Ödenebilir' : '❌ Ödenemez!'}
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center border border-green-800/20">
              <div className="text-xs text-green-300 mb-1">Ödeme Sonrası</div>
              <div className={`text-lg font-bold ${game.money - 100 >= 0 ? 'text-amber-200' : 'text-red-400'}`}>
                {game.money - (game.money >= 100 ? 100 : 0)} 💰
              </div>
            </div>
          </div>

          {game.failedPayments > 0 && (
            <div className="bg-red-950/40 border border-red-600/30 rounded-xl p-3 mb-4 text-center">
              <p className="text-red-300 text-sm">
                ⚠️ Ödenemeyen gün: <span className="font-bold">{game.failedPayments}/3</span>
                {game.failedPayments >= 2 && <span className="block text-red-400 font-bold mt-1">🚨 Son şans! Bir daha ödeyemezsen dükkân kapanır!</span>}
              </p>
            </div>
          )}

          {game.carbon >= 70 && (
            <div className="bg-orange-950/40 border border-orange-600/30 rounded-xl p-3 mb-4 text-center">
              <p className="text-orange-300 text-sm">
                🌫️ <span className="font-bold">Çuvalın çok dolu!</span> Karbon {game.carbon}/100. Orman ağırlaşıyor...
              </p>
            </div>
          )}

          {game.trees > 0 && (
            <div className="bg-green-950/40 border border-green-600/30 rounded-xl p-3 mb-4 text-center">
              <p className="text-green-300 text-sm">
                🌱 {game.trees} fidanın her gün {game.trees * 2} karbon emiyor. Orman teşekkür ediyor!
              </p>
            </div>
          )}

          <button
            onClick={endDay}
            className="w-full px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-600/30 text-lg"
          >
            {game.day >= 10 ? '🏁 Sonuçları Gör' : '🌙 Geceyi Geçir'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderMiniChart = () => {
    const maxCarbon = Math.max(...game.carbonHistory, 1);
    const maxMoney = Math.max(...game.moneyHistory, 1);
    
    return (
      <div className="bg-black/20 rounded-xl p-4 mb-4 border border-green-800/20">
        <h4 className="text-sm text-green-300 mb-3 font-medium">📊 10 Günlük Seyir</h4>
        <div className="flex items-end gap-1 h-20">
          {game.carbonHistory.map((c, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div 
                className="w-full rounded-t transition-all"
                style={{ 
                  height: `${(c / maxCarbon) * 60}px`,
                  backgroundColor: c > 70 ? '#ef4444' : c > 40 ? '#eab308' : '#22c55e',
                  minHeight: '4px'
                }}
              />
              <span className="text-[9px] text-green-500">{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-green-500 mt-1">
          <span>🌫️ Karbon seviyesi</span>
          <span>Gün 1 → Gün {game.carbonHistory.length}</span>
        </div>
      </div>
    );
  };

  const renderFinal = () => {
    const ending = getEnding();
    const isGreen = ending.subtitle === 'Final A';
    const isGold = ending.subtitle === 'Final B';
    
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${
        isGreen ? 'bg-gradient-to-b from-green-950 via-emerald-900 to-green-950' :
        isGold ? 'bg-gradient-to-b from-amber-950 via-yellow-900 to-amber-950' :
        'bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950'
      }`}>
        {isGreen && Array.from({ length: 15 }).map((_, i) => (
          <FloatingLeaf key={i} delay={i * 0.4} left={3 + i * 6.5} />
        ))}
        
        <div className="max-w-2xl w-full relative z-10">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-green-500/20 shadow-2xl text-center animate-fadeIn">
            <span className="text-7xl mb-4 block animate-float">{ending.emoji}</span>
            <p className="text-green-400 text-sm mb-1">{ending.subtitle}</p>
            <h2 className="text-3xl font-bold text-amber-200 mb-4">{ending.title}</h2>
            <p className="text-green-100 text-lg leading-relaxed mb-6">{ending.text}</p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-black/30 rounded-lg p-3 border border-green-800/20">
                <div className="text-xs text-green-300">💰 Toplam Para</div>
                <div className="text-2xl font-bold text-amber-200">{game.money}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-green-800/20">
                <div className="text-xs text-green-300">🌫️ Karbon</div>
                <div className={`text-2xl font-bold ${game.carbon < 50 ? 'text-green-300' : 'text-red-400'}`}>{game.carbon}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-green-800/20">
                <div className="text-xs text-green-300">😊 Memnuniyet</div>
                <div className="text-2xl font-bold text-amber-200">{game.satisfaction}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-green-800/20">
                <div className="text-xs text-green-300">🌱 Fidanlar</div>
                <div className="text-2xl font-bold text-green-300">{game.trees}</div>
              </div>
            </div>

            {/* Mini chart */}
            {game.carbonHistory.length > 1 && renderMiniChart()}

            {/* Decision summary */}
            {game.decisionsMade.length > 0 && (
              <div className="bg-black/20 rounded-xl p-4 mb-4 text-left border border-green-800/20">
                <h4 className="text-sm text-amber-200 font-bold mb-2 text-center">📋 Karar Özetin</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {game.decisionsMade.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-green-200 border-b border-green-900/30 pb-1">
                      <span>{d.customerEmoji}</span>
                      <span className="flex-1 truncate">{d.choiceLabel}</span>
                      <span className={`${d.moneyChange > 0 ? 'text-green-400' : 'text-red-400'}`}>💰{d.moneyChange > 0 ? '+' : ''}{d.moneyChange}</span>
                      <span className={`${d.carbonChange > 0 ? 'text-red-400' : 'text-green-400'}`}>🌫️{d.carbonChange > 0 ? '+' : ''}{d.carbonChange}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owl's final message */}
            <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mb-6">
              <p className="text-purple-300 text-xs mb-2 font-medium">🦉 Öğretmen Baykuş'un son notu:</p>
              <p className="text-purple-100 text-sm leading-relaxed italic">
                "Bir çuvalı doldurmak kolaydır. Zor olan, içindeki yükü kimin taşıdığını fark etmektir. 
                Her kararın bir bedeli vardır; kimi bugün ödenir, kimi yarına kalır. 
                Peki sen, kazandıklarını sayarken geride ne bıraktın?"
              </p>
            </div>

            {/* Reflection questions */}
            <div className="bg-black/20 rounded-xl p-4 mb-6 text-left border border-green-800/20">
              <h3 className="text-amber-200 font-bold mb-3 text-center text-sm">🤔 Düşünme Soruları</h3>
              <ol className="space-y-2 text-green-200 text-sm list-decimal list-inside">
                <li>Gerçek hayatta hangi tüketim alışkanlığını değiştirebilirsin?</li>
                <li>Kısa vadeli kazanç ile uzun vadeli fayda çatıştığında nasıl karar verirsin?</li>
                <li>Bir bireyin küçük kararları, ortak bir çevre sorununu çözmeye nasıl katkıda bulunabilir?</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <button
                onClick={restartGame}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-600/30 text-lg"
              >
                🔄 Tekrar Oyna
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  switch (game.phase) {
    case 'intro':
      return renderIntro();
    case 'dayStart':
      return renderDayStart();
    case 'customerDecision':
      return renderCustomerDecision();
    case 'dayEnd':
      return renderDayEnd();
    case 'final':
      return renderFinal();
    default:
      return renderIntro();
  }
}

export default App;
