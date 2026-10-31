export interface Customer {
  id: string;
  name: string;
  emoji: string;
  request: string;
  description: string;
  options: DecisionOption[];
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  moneyChange: number;
  carbonChange: number;
  satisfactionChange: number;
}

export interface WeatherEvent {
  id: string;
  name: string;
  description: string;
  emoji: string;
  carbonMultiplier: number;
  moneyMultiplier: number;
}

export interface DailyEvent {
  day: number;
  title: string;
  text: string;
  emoji: string;
}

export const dailyEvents: DailyEvent[] = [
  {
    day: 1,
    title: "İlk Gün",
    text: "Dükkânın kapılarını açıyorsun. Kunduz'un öğütleri kulaklarında yankılanıyor. İlk müşteriler kapıda bekliyor.",
    emoji: "🌅"
  },
  {
    day: 2,
    title: "Sıcaklık Artıyor",
    text: "Dün gece termometre normalin üstünde seyretti. Orman sessizce ısınmaya devam ediyor.",
    emoji: "🌡️"
  },
  {
    day: 3,
    title: "Gölet Küçülüyor",
    text: "Sabah gölete baktığında su seviyesinin düştüğünü fark ettin. Balıklar yüzeye çıkmış.",
    emoji: "💧"
  },
  {
    day: 4,
    title: "Rüzgâr Değişti",
    text: "Bugün rüzgâr farklı esiyor. Uzaklardan gelen duman kokusu ormanın üzerine çökmüş.",
    emoji: "💨"
  },
  {
    day: 5,
    title: "Yarı Yol",
    text: "Beşinci gün. Müşteriler seni tanımaya başladı. Ama çuvalın da ağırlaşıyor.",
    emoji: "⚖️"
  },
  {
    day: 6,
    title: "Kuraklık Uyarısı",
    text: "Öğretmen Baykuş bir uyarı bıraktı: 'Su azalıyor. Her damla kıymetli.'",
    emoji: "🏜️"
  },
  {
    day: 7,
    title: "Sera Çatlıyor",
    text: "Sıcaklık o kadar arttı ki seranın camları çatlamaya başladı. Ürünler risk altında.",
    emoji: "🏭"
  },
  {
    day: 8,
    title: "Küçük Bir Umut",
    text: "Diktiğin fidanlar (eğer varsa) yeşermeye başladı. Orman nefes alıyor.",
    emoji: "🌱"
  },
  {
    day: 9,
    title: "Son Hazırlık",
    text: "Yarın son gün. Kasadaki parayı, çuvaldaki yükü ve müşterilerin yüzünü tartıyorsun.",
    emoji: "📋"
  },
  {
    day: 10,
    title: "Son Gün",
    text: "Bugün her kararın iki kat önemli. Kunduz kapının arkasında bekliyor.",
    emoji: "🏁"
  }
];

export const weatherEvents: WeatherEvent[] = [
  {
    id: "normal",
    name: "Normal Hava",
    description: "Bugün hava sakin.",
    emoji: "☀️",
    carbonMultiplier: 1.0,
    moneyMultiplier: 1.0
  },
  {
    id: "heatwave",
    name: "Sıcak Hava Dalgası",
    description: "Aşırı sıcak! Ürünlerin karbon maliyeti artıyor.",
    emoji: "🔥",
    carbonMultiplier: 1.5,
    moneyMultiplier: 0.8
  },
  {
    id: "rain",
    name: "Sağanak Yağmur",
    description: "Yağmur ormanı serinletti. Müşteriler azaldı ama karbon maliyeti düştü.",
    emoji: "🌧️",
    carbonMultiplier: 0.7,
    moneyMultiplier: 0.9
  },
  {
    id: "drought",
    name: "Kuraklık",
    description: "Su azaldı. Sera ürünleri daha pahalı.",
    emoji: "🏜️",
    carbonMultiplier: 1.3,
    moneyMultiplier: 0.7
  },
  {
    id: "wind",
    name: "Fırtına",
    description: "Güçlü rüzgâr ithal ürünleri geciktirdi.",
    emoji: "🌪️",
    carbonMultiplier: 1.0,
    moneyMultiplier: 1.2
  }
];

export const customers: Customer[] = [
  {
    id: "giraffe",
    name: "Zürafa",
    emoji: "🦒",
    request: "Kışın ortasında taze portakal suyu",
    description: "\"Ne olursa olsun bugün portakal içeceğim!\" diyor Zürafa.",
    options: [
      {
        id: "accept",
        label: "Sera portakalını ver",
        description: "Sera ürünü. Para kazandırır ama karbon yükü yüksek.",
        moneyChange: 40,
        carbonChange: 15,
        satisfactionChange: 10
      },
      {
        id: "reject",
        label: "Mevsimi değil, reddet",
        description: "Dürüst ama müşteri memnun olmaz.",
        moneyChange: 0,
        carbonChange: 0,
        satisfactionChange: -15
      },
      {
        id: "alternative",
        label: "Mevsimlik elma suyu öner",
        description: "Daha az kazanç, düşük karbon, müşteri idare edilir.",
        moneyChange: 20,
        carbonChange: 3,
        satisfactionChange: 5
      }
    ]
  },
  {
    id: "tiger",
    name: "Kaplan",
    emoji: "🐯",
    request: "Uzak diyarlardan ithal avokadolu tost",
    description: "\"Bunu bana hemen hazırla. Başka bir şey istemiyorum.\" diyor Kaplan.",
    options: [
      {
        id: "accept",
        label: "İthal avokadoyu hazırla",
        description: "İyi para ama uzun mesafeden gelen ürünün karbon bedeli ağır.",
        moneyChange: 60,
        carbonChange: 25,
        satisfactionChange: 15
      },
      {
        id: "reject",
        label: "Reddet - stokta yok de",
        description: "Kaplan sinirlenir ama karbon yüklenmezsin.",
        moneyChange: 0,
        carbonChange: 0,
        satisfactionChange: -20
      },
      {
        id: "alternative",
        label: "Yerel cevizli tost öner",
        description: "Yerel ürün, orta kazanç, düşük karbon.",
        moneyChange: 30,
        carbonChange: 5,
        satisfactionChange: 0
      }
    ]
  },
  {
    id: "squirrel",
    name: "Fidancı Sincap",
    emoji: "🐿️",
    request: "Sana bir fidan bırakmak istiyor",
    description: "\"Bu fidan bugün sana büyük kazanç sağlamayacak. Ama onu büyütürsen zamanla ormana nefes aldırabilir.\"",
    options: [
      {
        id: "accept",
        label: "Fidanı satın al ve dik",
        description: "Para harcarsın ama karbon yükün azalır. Uzun vadeli yatırım.",
        moneyChange: -30,
        carbonChange: -20,
        satisfactionChange: 5
      },
      {
        id: "reject",
        label: "Reddet - param yok de",
        description: "Para cebinde kalır ama fidan dikilmez.",
        moneyChange: 0,
        carbonChange: 0,
        satisfactionChange: -5
      },
      {
        id: "alternative",
        label: "Yarısını öde, yarısını sonra",
        description: "Orta yol. Hem fidan dikilir hem cebin çok boşalmaz.",
        moneyChange: -15,
        carbonChange: -10,
        satisfactionChange: 3
      }
    ]
  },
  {
    id: "bear",
    name: "Kömürcü Ayı",
    emoji: "🐻",
    request: "Sana kömür jeneratörü teklif ediyor",
    description: "\"Bu jeneratör dükkânını aydınlatır, müşterileri çeker. Ama dumanı da ormana yayılır.\"",
    options: [
      {
        id: "accept",
        label: "Jeneratörü satın al",
        description: "Kısa vadede çok para kazandırır ama karbon yükün artar.",
        moneyChange: 50,
        carbonChange: 30,
        satisfactionChange: 5
      },
      {
        id: "reject",
        label: "Reddet - ormana zarar verir",
        description: "Kârı kaçırırsın ama orman seni unutmez.",
        moneyChange: 0,
        carbonChange: 0,
        satisfactionChange: -5
      },
      {
        id: "alternative",
        label: "Güneş paneli öner",
        description: "Pahalı ama temiz. Uzun vadede kâr.",
        moneyChange: -20,
        carbonChange: -15,
        satisfactionChange: 10
      }
    ]
  },
  {
    id: "rabbit",
    name: "Tavşan",
    emoji: "🐰",
    request: "Mevsimlik sebzelerden salata",
    description: "\"Mevsiminde ne varsa onu yerim\" diyor Tavşan. \"Doğala bayılırım.\"",
    options: [
      {
        id: "accept",
        label: "Mevsimlik sebzelerle hazırla",
        description: "Düşük karbon, orta kazanç. Doğal ve sürdürülebilir.",
        moneyChange: 25,
        carbonChange: 2,
        satisfactionChange: 10
      },
      {
        id: "reject",
        label: "Bugün mevsimlik yok de",
        description: "Yalan söylemek zorunda değilsin ama müşteri üzülür.",
        moneyChange: 0,
        carbonChange: 0,
        satisfactionChange: -10
      },
      {
        id: "alternative",
        label: "Mevsimlik + az miktarda sera ürünü",
        description: "Karışım. Hem doğal hem bol. Orta karbon.",
        moneyChange: 35,
        carbonChange: 8,
        satisfactionChange: 12
      }
    ]
  },
  {
    id: "hedgehog",
    name: "Kirpi",
    emoji: "🦔",
    request: "Yerel orman balı ve ceviz",
    description: "\"Komşu arıcının balını isterim. Uzaklardan geleni değil.\"",
    options: [
      {
        id: "accept",
        label: "Yerel bal ve ceviz servis et",
        description: "Yerel ürün. Düşük karbon, orta kazanç.",
        moneyChange: 30,
        carbonChange: 3,
        satisfactionChange: 12
      },
      {
        id: "reject",
        label: "Stokta yok de",
        description: "Basit bir reddediş. Müşteri başka yere gider.",
        moneyChange: 0,
        carbonChange: 0,
        satisfactionChange: -8
      },
      {
        id: "alternative",
        label: "Yerel bal + ithal çikolata",
        description: "Karışık. Müşteri mutlu ama karbon artar.",
        moneyChange: 45,
        carbonChange: 12,
        satisfactionChange: 15
      }
    ]
  },
  {
    id: "deer",
    name: "Geyik",
    emoji: "🦌",
    request: "Uzak diyarlardan gelen egzotik baharatlar",
    description: "\"Yemeklerime farklı tatlar katmak istiyorum. En pahalısından olsun.\"",
    options: [
      {
        id: "accept",
        label: "İthal baharatları sat",
        description: "Yüksek kazanç ama uzun mesafeden gelen ürün.",
        moneyChange: 55,
        carbonChange: 20,
        satisfactionChange: 10
      },
      {
        id: "reject",
        label: "Reddet - gereksiz lüks de",
        description: "Geyik küser ama karbon yüklenmezsin.",
        moneyChange: 0,
        carbonChange: 0,
        satisfactionChange: -15
      },
      {
        id: "alternative",
        label: "Yerel otlar ve baharatlar öner",
        description: "Ormanın kendi baharatları. Düşük karbon, orta kazanç.",
        moneyChange: 25,
        carbonChange: 2,
        satisfactionChange: 3
      }
    ]
  },
  {
    id: "owl_teacher",
    name: "Öğretmen Baykuş",
    emoji: "🦉",
    request: "Sana karbon defterini göstermek istiyor",
    description: "\"Bir kararın yalnızca fiyatına bakarsan maliyetinin tamamını göremezsin.\"",
    options: [
      {
        id: "accept",
        label: "Defteri dikkatle incele",
        description: "Zaman alır ama gelecek kararların için bilgi kazanırsın.",
        moneyChange: -10,
        carbonChange: -5,
        satisfactionChange: 8
      },
      {
        id: "reject",
        label: "Vaktim yok de",
        description: "Hızlı karar. Ama bilgi eksik kalır.",
        moneyChange: 5,
        carbonChange: 5,
        satisfactionChange: -5
      },
      {
        id: "alternative",
        label: "Özetini iste, sonra bakarsın",
        description: "Orta yol. Az bilgi, az zaman kaybı.",
        moneyChange: -5,
        carbonChange: -2,
        satisfactionChange: 3
      }
    ]
  },
  {
    id: "fox",
    name: "Tilki",
    emoji: "🦊",
    request: "Ucuz ama uzaklardan gelen atıştırmalık",
    description: "\"En ucuzunu ver bana. Markası ne olursa olsun, yeter ki ucuz olsun.\"",
    options: [
      {
        id: "accept",
        label: "Ucuz ithal ürünü ver",
        description: "Müşteri mutlu ama karbon maliyeti yüksek.",
        moneyChange: 20,
        carbonChange: 18,
        satisfactionChange: 8
      },
      {
        id: "reject",
        label: "Reddet - kalitesiz de",
        description: "Tilki başka dükkâna gider.",
        moneyChange: 0,
        carbonChange: 0,
        satisfactionChange: -12
      },
      {
        id: "alternative",
        label: "Yerel ve uygun fiyatlı ürün öner",
        description: "Biraz daha pahalı ama temiz.",
        moneyChange: 15,
        carbonChange: 4,
        satisfactionChange: 2
      }
    ]
  },
  {
    id: "elephant",
    name: "Fil",
    emoji: "🐘",
    request: "Toplu sipariş - dükkânın tüm stoğunu almak istiyor",
    description: "\"Her şeyi alıyorum. Fiyatı yüksek olsun, yeter ki her şeyi verebilesin.\"",
    options: [
      {
        id: "accept",
        label: "Tüm stoğu sat",
        description: "Büyük kazanç ama çuvalın ağzına kadar dolar.",
        moneyChange: 80,
        carbonChange: 35,
        satisfactionChange: 10
      },
      {
        id: "reject",
        label: "Reddet - stok başkalarına da lazım",
        description: "Fil gider ama yarının müşterileri için stok kalır.",
        moneyChange: 0,
        carbonChange: 0,
        satisfactionChange: -10
      },
      {
        id: "alternative",
        label: "Yarısını yerel, yarısını ithal ver",
        description: "Dengeli. Hem Fil mutlu hem çuval çok dolmaz.",
        moneyChange: 50,
        carbonChange: 15,
        satisfactionChange: 8
      }
    ]
  }
];

export const storyIntro = [
  {
    title: "Bir Zamanlar...",
    text: "Bir zamanlar hayvanların yaşadığı yemyeşil bir orman vardı. Nehirler berrak, ağaçlar gür, mevsimler düzenliydi. Her hayvan ihtiyacı kadar üretir, ihtiyacı kadar tüketirdi.",
    emoji: "🌳"
  },
  {
    title: "Değişim Başladı",
    text: "Fakat zamanla ormanda bir şeyler değişmeye başladı. Uzak diyarlardan gelen yiyecekler çoğaldı. Mevsimi olmayan meyveler yetiştirmek için dev seralar kuruldu. Kömürle çalışan makineler işleri hızlandırdı.",
    emoji: "🏭"
  },
  {
    title: "Sonuçlar",
    text: "Sonra yazlar uzadı. Kışlar değişti. Göletler küçüldü. Hayvanlar, eskiden sıradan olan hava sıcaklıklarının artık dayanılmaz hâle geldiğini fark etti.",
    emoji: "🌡️"
  },
  {
    title: "Çuval Yasası",
    text: "Ormanın yaşlı baykuşları bir araya geldi ve yeni bir kural ilan etti: \"Bundan böyle her canlının doğaya yüklediği karbon, kendi çuvalında taşınacak. Çuval doldukça dünya ağırlaşacak.\"",
    emoji: "📜"
  },
  {
    title: "Sen Kimsin?",
    text: "Sen, küçük bir orman kasabasında yaşayan genç bir çalışansın. Kunduz'un dükkânında işe başladın. On gün boyunca dükkânı ayakta tutabilirsen, dükkânı sana devredecekti.",
    emoji: "🧑‍💼"
  },
  {
    title: "Görevin",
    text: "Her gün müşteriler gelecek. Her müşterinin bir isteği, her isteğin bir bedeli olacak. Kasayı doldur, çuvalı hafif tut, müşterileri memnun et. 10 günün sonunda dükkân senin olacak... Ama ormanın geleceği de senin ellerinde.",
    emoji: "🎯"
  }
];

export const endings = {
  green: {
    title: "🌿 Yeşeren Orman",
    subtitle: "Final A",
    text: "Karbonunu düşük tutmayı başardın ve dükkânı ayakta tuttun. Kasabanın diğer esnafı da senin yöntemlerini merak etmeye başladı. Artık yalnızca bir dükkânın değil, yeni bir alışkanlığın da sahibisin. Orman sana teşekkür ediyor.",
    emoji: "🌳✨"
  },
  gold: {
    title: "💰 Altın Kasa, Ağır Çuval",
    subtitle: "Final B",
    text: "Hedef paraya ulaştın, ama çuvalın ağır. Dükkânı kazandın; yine de ormanın geleceği için ödenmesi gereken bir bedel var. Gerçek başarıya ulaşmak için iş yapma biçimini yeniden düşünmen gerekiyor.",
    emoji: "⚖️"
  },
  closed: {
    title: "🚪 Kapanan Kepenkler",
    subtitle: "Final C",
    text: "On günü tamamlayamadın. Belki kısa vadeli kazanca fazla güvendin, belki de müşterilerle kurduğun dengeyi kaybettin. Fakat hikâye burada bitmiyor: Artık hangi kararların seni zor durumda bıraktığını biliyorsun. Bir sonraki denemede farklı bir strateji kurabilirsin.",
    emoji: "🔄"
  }
};

export const owlWisdom = [
  "\"Bir kararın yalnızca fiyatına bakarsan maliyetinin tamamını göremezsin.\"",
  "\"Bazen en pahalı görünen seçenek, uzun vadede en ucuz olanıdır.\"",
  "\"Bazen de en kârlı görünen seçenek, geleceğinden borç almaktır.\"",
  "\"Doğa aceleyi sevmez. Her fidan bir yemin, her çuval bir sorumluluktur.\"",
  "\"Kısa vadeli kazanç ile uzun vadeli fayda çatıştığında, ormanı düşün.\""
];
