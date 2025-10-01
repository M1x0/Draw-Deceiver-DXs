import { WordPair, WordCategory, Language } from "@shared/schema";

export const wordDatabase: WordPair[] = [
  // Animals - English
  {
    target: "ELEPHANT",
    decoys: {
      easy: ["HIPPO", "RHINO"],
      medium: ["MAMMOTH", "WALRUS"],
      hard: ["MANATEE", "TAPIR"]
    },
    category: "animals",
    language: "english"
  },
  {
    target: "GIRAFFE",
    decoys: {
      easy: ["ZEBRA", "HORSE"],
      medium: ["OKAPI", "LLAMA"],
      hard: ["ALPACA", "CAMEL"]
    },
    category: "animals",
    language: "english"
  },
  {
    target: "PENGUIN",
    decoys: {
      easy: ["DUCK", "SWAN"],
      medium: ["PUFFIN", "SEAGULL"],
      hard: ["ALBATROSS", "PELICAN"]
    },
    category: "animals",
    language: "english"
  },
  {
    target: "BUTTERFLY",
    decoys: {
      easy: ["MOTH", "BEE"],
      medium: ["DRAGONFLY", "LADYBUG"],
      hard: ["FIREFLY", "CRICKET"]
    },
    category: "animals",
    language: "english"
  },
  {
    target: "OCTOPUS",
    decoys: {
      easy: ["SQUID", "JELLYFISH"],
      medium: ["CUTTLEFISH", "STARFISH"],
      hard: ["NAUTILUS", "ANEMONE"]
    },
    category: "animals",
    language: "english"
  },
  {
    target: "KANGAROO",
    decoys: {
      easy: ["RABBIT", "DEER"],
      medium: ["WALLABY", "KOALA"],
      hard: ["WOMBAT", "QUOKKA"]
    },
    category: "animals",
    language: "english"
  },
  {
    target: "TIGER",
    decoys: {
      easy: ["LION", "LEOPARD"],
      medium: ["CHEETAH", "JAGUAR"],
      hard: ["LYNX", "OCELOT"]
    },
    category: "animals",
    language: "english"
  },
  {
    target: "DOLPHIN",
    decoys: {
      easy: ["WHALE", "SHARK"],
      medium: ["PORPOISE", "ORCA"],
      hard: ["NARWHAL", "BELUGA"]
    },
    category: "animals",
    language: "english"
  },

  // Food - English
  {
    target: "PIZZA",
    decoys: {
      easy: ["BURGER", "SANDWICH"],
      medium: ["CALZONE", "FLATBREAD"],
      hard: ["FOCACCIA", "PANINI"]
    },
    category: "food",
    language: "english"
  },
  {
    target: "SUSHI",
    decoys: {
      easy: ["RICE", "FISH"],
      medium: ["SASHIMI", "MAKI"],
      hard: ["NIGIRI", "TEMPURA"]
    },
    category: "food",
    language: "english"
  },
  {
    target: "CUPCAKE",
    decoys: {
      easy: ["CAKE", "MUFFIN"],
      medium: ["BROWNIE", "COOKIE"],
      hard: ["MACARON", "ECLAIR"]
    },
    category: "food",
    language: "english"
  },
  {
    target: "TACO",
    decoys: {
      easy: ["BURRITO", "WRAP"],
      medium: ["QUESADILLA", "ENCHILADA"],
      hard: ["CHALUPA", "GORDITA"]
    },
    category: "food",
    language: "english"
  },
  {
    target: "ICE CREAM",
    decoys: {
      easy: ["YOGURT", "PUDDING"],
      medium: ["GELATO", "SORBET"],
      hard: ["SEMIFREDDO", "GRANITA"]
    },
    category: "food",
    language: "english"
  },
  {
    target: "APPLE",
    decoys: {
      easy: ["ORANGE", "BANANA"],
      medium: ["PEAR", "PEACH"],
      hard: ["QUINCE", "PERSIMMON"]
    },
    category: "food",
    language: "english"
  },

  // Objects - English
  {
    target: "UMBRELLA",
    decoys: {
      easy: ["RAINCOAT", "HAT"],
      medium: ["PARASOL", "CANOPY"],
      hard: ["AWNING", "GAZEBO"]
    },
    category: "objects",
    language: "english"
  },
  {
    target: "TELESCOPE",
    decoys: {
      easy: ["BINOCULARS", "CAMERA"],
      medium: ["MICROSCOPE", "PERISCOPE"],
      hard: ["SEXTANT", "THEODOLITE"]
    },
    category: "objects",
    language: "english"
  },
  {
    target: "GUITAR",
    decoys: {
      easy: ["PIANO", "DRUMS"],
      medium: ["BANJO", "UKULELE"],
      hard: ["MANDOLIN", "LUTE"]
    },
    category: "objects",
    language: "english"
  },
  {
    target: "BACKPACK",
    decoys: {
      easy: ["BAG", "SUITCASE"],
      medium: ["RUCKSACK", "DUFFEL"],
      hard: ["HAVERSACK", "KNAPSACK"]
    },
    category: "objects",
    language: "english"
  },
  {
    target: "CLOCK",
    decoys: {
      easy: ["WATCH", "TIMER"],
      medium: ["SUNDIAL", "HOURGLASS"],
      hard: ["CHRONOMETER", "METRONOME"]
    },
    category: "objects",
    language: "english"
  },
  {
    target: "LAMP",
    decoys: {
      easy: ["CANDLE", "TORCH"],
      medium: ["LANTERN", "CHANDELIER"],
      hard: ["SCONCE", "BRAZIER"]
    },
    category: "objects",
    language: "english"
  },

  // Actions - English
  {
    target: "DANCING",
    decoys: {
      easy: ["JUMPING", "RUNNING"],
      medium: ["SPINNING", "TWIRLING"],
      hard: ["PIROUETTING", "WALTZING"]
    },
    category: "actions",
    language: "english"
  },
  {
    target: "SWIMMING",
    decoys: {
      easy: ["DIVING", "FLOATING"],
      medium: ["SURFING", "KAYAKING"],
      hard: ["SNORKELING", "PADDLING"]
    },
    category: "actions",
    language: "english"
  },
  {
    target: "SLEEPING",
    decoys: {
      easy: ["RESTING", "LYING"],
      medium: ["NAPPING", "DOZING"],
      hard: ["SNOOZING", "SLUMBERING"]
    },
    category: "actions",
    language: "english"
  },
  {
    target: "COOKING",
    decoys: {
      easy: ["EATING", "BAKING"],
      medium: ["GRILLING", "FRYING"],
      hard: ["SAUTEING", "BRAISING"]
    },
    category: "actions",
    language: "english"
  },
  {
    target: "PAINTING",
    decoys: {
      easy: ["DRAWING", "WRITING"],
      medium: ["SKETCHING", "COLORING"],
      hard: ["ILLUSTRATING", "RENDERING"]
    },
    category: "actions",
    language: "english"
  },

  // Places - English
  {
    target: "MOUNTAIN",
    decoys: {
      easy: ["HILL", "VALLEY"],
      medium: ["PEAK", "SUMMIT"],
      hard: ["RIDGE", "PLATEAU"]
    },
    category: "places",
    language: "english"
  },
  {
    target: "BEACH",
    decoys: {
      easy: ["OCEAN", "LAKE"],
      medium: ["SHORE", "COAST"],
      hard: ["HARBOR", "LAGOON"]
    },
    category: "places",
    language: "english"
  },
  {
    target: "CASTLE",
    decoys: {
      easy: ["HOUSE", "TOWER"],
      medium: ["FORTRESS", "PALACE"],
      hard: ["CITADEL", "STRONGHOLD"]
    },
    category: "places",
    language: "english"
  },
  {
    target: "FOREST",
    decoys: {
      easy: ["TREES", "WOODS"],
      medium: ["JUNGLE", "GROVE"],
      hard: ["THICKET", "WOODLAND"]
    },
    category: "places",
    language: "english"
  },
  {
    target: "DESERT",
    decoys: {
      easy: ["SAND", "DUNE"],
      medium: ["OASIS", "WASTELAND"],
      hard: ["SAVANNA", "STEPPE"]
    },
    category: "places",
    language: "english"
  },

  // Abstract - English
  {
    target: "HAPPINESS",
    decoys: {
      easy: ["JOY", "FUN"],
      medium: ["DELIGHT", "PLEASURE"],
      hard: ["EUPHORIA", "BLISS"]
    },
    category: "abstract",
    language: "english"
  },
  {
    target: "FEAR",
    decoys: {
      easy: ["SCARY", "WORRY"],
      medium: ["ANXIETY", "DREAD"],
      hard: ["TERROR", "PANIC"]
    },
    category: "abstract",
    language: "english"
  },
  {
    target: "LOVE",
    decoys: {
      easy: ["LIKE", "CARE"],
      medium: ["AFFECTION", "PASSION"],
      hard: ["ADORATION", "DEVOTION"]
    },
    category: "abstract",
    language: "english"
  },
  {
    target: "TIME",
    decoys: {
      easy: ["CLOCK", "HOUR"],
      medium: ["MOMENT", "PERIOD"],
      hard: ["DURATION", "EPOCH"]
    },
    category: "abstract",
    language: "english"
  },
  {
    target: "FREEDOM",
    decoys: {
      easy: ["FREE", "LIBERTY"],
      medium: ["INDEPENDENCE", "RELEASE"],
      hard: ["AUTONOMY", "EMANCIPATION"]
    },
    category: "abstract",
    language: "english"
  },

  // Animals - Swedish
  {
    target: "ELEFANT",
    decoys: {
      easy: ["FLODHÄST", "NOSHÖRNING"],
      medium: ["MAMMUT", "VALROSS"],
      hard: ["MANATE", "TAPIR"]
    },
    category: "animals",
    language: "swedish"
  },
  {
    target: "GIRAFF",
    decoys: {
      easy: ["ZEBRA", "HÄST"],
      medium: ["OKAPI", "LAMA"],
      hard: ["ALPACKA", "KAMEL"]
    },
    category: "animals",
    language: "swedish"
  },
  {
    target: "PINGVIN",
    decoys: {
      easy: ["ANKA", "SVAN"],
      medium: ["LUNNEFÅGEL", "MÅS"],
      hard: ["ALBATROSS", "PELIKAN"]
    },
    category: "animals",
    language: "swedish"
  },
  {
    target: "FJÄRIL",
    decoys: {
      easy: ["MAL", "BI"],
      medium: ["TROLLSLÄNDA", "NYCKELPIGA"],
      hard: ["LYSMASK", "SYRSA"]
    },
    category: "animals",
    language: "swedish"
  },
  {
    target: "BLÄCKFISK",
    decoys: {
      easy: ["TIOARMAD BLÄCKFISK", "MANET"],
      medium: ["SEPIA", "SJÖSTJÄRNA"],
      hard: ["NAUTILUS", "HAVSANEMONE"]
    },
    category: "animals",
    language: "swedish"
  },

  // Food - Swedish
  {
    target: "PIZZA",
    decoys: {
      easy: ["HAMBURGARE", "SMÖRGÅS"],
      medium: ["CALZONE", "FLATBRÖD"],
      hard: ["FOCACCIA", "PANINI"]
    },
    category: "food",
    language: "swedish"
  },
  {
    target: "SUSHI",
    decoys: {
      easy: ["RIS", "FISK"],
      medium: ["SASHIMI", "MAKI"],
      hard: ["NIGIRI", "TEMPURA"]
    },
    category: "food",
    language: "swedish"
  },
  {
    target: "MUFFINS",
    decoys: {
      easy: ["TÅRTA", "BULLE"],
      medium: ["BROWNIE", "KAKA"],
      hard: ["MACARON", "ECLAIR"]
    },
    category: "food",
    language: "swedish"
  },
  {
    target: "TACO",
    decoys: {
      easy: ["BURRITO", "WRAP"],
      medium: ["QUESADILLA", "ENCHILADA"],
      hard: ["CHALUPA", "GORDITA"]
    },
    category: "food",
    language: "swedish"
  },
  {
    target: "GLASS",
    decoys: {
      easy: ["YOGHURT", "PUDDING"],
      medium: ["GELATO", "SORBET"],
      hard: ["SEMIFREDDO", "GRANITA"]
    },
    category: "food",
    language: "swedish"
  },

  // Objects - Swedish
  {
    target: "PARAPLY",
    decoys: {
      easy: ["REGNROCK", "HATT"],
      medium: ["PARASOLL", "BALDAKIN"],
      hard: ["MARKIS", "PAVILJONG"]
    },
    category: "objects",
    language: "swedish"
  },
  {
    target: "TELESKOP",
    decoys: {
      easy: ["KIKARE", "KAMERA"],
      medium: ["MIKROSKOP", "PERISKOP"],
      hard: ["SEXTANT", "TEODOLIT"]
    },
    category: "objects",
    language: "swedish"
  },
  {
    target: "GITARR",
    decoys: {
      easy: ["PIANO", "TRUMMOR"],
      medium: ["BANJO", "UKULELE"],
      hard: ["MANDOLIN", "LUTA"]
    },
    category: "objects",
    language: "swedish"
  },
  {
    target: "RYGGSÄCK",
    decoys: {
      easy: ["VÄSKA", "RESVÄSKA"],
      medium: ["RANSEL", "SPORTBAG"],
      hard: ["TORNYSTER", "KNAPSÄCK"]
    },
    category: "objects",
    language: "swedish"
  },

  // Actions - Swedish
  {
    target: "DANS",
    decoys: {
      easy: ["HOPP", "SPRING"],
      medium: ["SNURR", "VIRVLA"],
      hard: ["PIRUETT", "VALS"]
    },
    category: "actions",
    language: "swedish"
  },
  {
    target: "SIMMA",
    decoys: {
      easy: ["DYKA", "FLYTA"],
      medium: ["SURFA", "PADDLA"],
      hard: ["SNORKLA", "RO"]
    },
    category: "actions",
    language: "swedish"
  },
  {
    target: "SOVA",
    decoys: {
      easy: ["VILA", "LIGGA"],
      medium: ["TUPPLUR", "DÅSA"],
      hard: ["SLUMRA", "DVALA"]
    },
    category: "actions",
    language: "swedish"
  },
  {
    target: "LAGA MAT",
    decoys: {
      easy: ["ÄTA", "BAKA"],
      medium: ["GRILLA", "STEKA"],
      hard: ["SAUTERA", "BRYSERA"]
    },
    category: "actions",
    language: "swedish"
  },

  // Places - Swedish
  {
    target: "BERG",
    decoys: {
      easy: ["KULLE", "DAL"],
      medium: ["TOPP", "KRÖN"],
      hard: ["ÅS", "PLATÅ"]
    },
    category: "places",
    language: "swedish"
  },
  {
    target: "STRAND",
    decoys: {
      easy: ["HAV", "SJÖ"],
      medium: ["KUST", "STRAND"],
      hard: ["HAMN", "LAGUN"]
    },
    category: "places",
    language: "swedish"
  },
  {
    target: "SLOTT",
    decoys: {
      easy: ["HUS", "TORN"],
      medium: ["FÄSTNING", "PALATS"],
      hard: ["CITADELL", "BORG"]
    },
    category: "places",
    language: "swedish"
  },

  // Abstract - Swedish
  {
    target: "LYCKA",
    decoys: {
      easy: ["GLÄDJE", "NÖJE"],
      medium: ["FRÖJD", "VÄLBEHAG"],
      hard: ["EUFORI", "SALIGHET"]
    },
    category: "abstract",
    language: "swedish"
  },
  {
    target: "RÄDSLA",
    decoys: {
      easy: ["SKRÄCK", "ORO"],
      medium: ["ÅNGEST", "FASA"],
      hard: ["TERROR", "PANIK"]
    },
    category: "abstract",
    language: "swedish"
  },
  {
    target: "KÄRLEK",
    decoys: {
      easy: ["GILLA", "OMSORG"],
      medium: ["TILLGIVENHET", "PASSION"],
      hard: ["BEUNDRAN", "HÄNGIVENHET"]
    },
    category: "abstract",
    language: "swedish"
  },
  {
    target: "TID",
    decoys: {
      easy: ["KLOCKA", "TIMME"],
      medium: ["ÖGONBLICK", "PERIOD"],
      hard: ["VARAKTIGHET", "EPOK"]
    },
    category: "abstract",
    language: "swedish"
  },
  {
    target: "FRIHET",
    decoys: {
      easy: ["FRI", "BEFRIELSE"],
      medium: ["SJÄLVSTÄNDIGHET", "FRIGÖRELSE"],
      hard: ["AUTONOMI", "EMANCIPATION"]
    },
    category: "abstract",
    language: "swedish"
  }
];

export function getWordPairsByCategories(
  categories: WordCategory[],
  language: Language
): WordPair[] {
  return wordDatabase.filter(
    (word) =>
      categories.includes(word.category) &&
      (language === "both" || word.language === language)
  );
}

export function getRandomWordPair(
  categories: WordCategory[],
  language: Language,
  difficulty: "easy" | "medium" | "hard"
): { target: string; decoy: string; category: WordCategory } | null {
  const availableWords = getWordPairsByCategories(categories, language);
  if (availableWords.length === 0) return null;

  const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
  const decoys = randomWord.decoys[difficulty];
  const randomDecoy = decoys[Math.floor(Math.random() * decoys.length)];

  return {
    target: randomWord.target,
    decoy: randomDecoy,
    category: randomWord.category
  };
}
