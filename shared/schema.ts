import { z } from "zod";

// Game modes enum
export const GameMode = z.enum([
  "classic_deceiver",
  "relay_draw",
  "fog_of_war",
  "double_deceiver",
  "shadow_lines",
  "tool_lockout",
  "time_bomb",
  "mirror_mayhem",
  "whisper_hints",
  "stencil_zones",
  "eraser_roulette",
  "camouflage_palette",
  "echo_brush",
  "ping_pong_guess",
  "sudden_death"
]);

export type GameMode = z.infer<typeof GameMode>;

// Word categories enum
export const WordCategory = z.enum([
  "animals",
  "objects",
  "food",
  "actions",
  "places",
  "abstract"
]);

export type WordCategory = z.infer<typeof WordCategory>;

// Game phase enum
export const GamePhase = z.enum([
  "lobby",
  "drawing",
  "guessing",
  "results",
  "round_end"
]);

export type GamePhase = z.infer<typeof GamePhase>;

// Player role enum
export const PlayerRole = z.enum([
  "target",
  "deceiver"
]);

export type PlayerRole = z.infer<typeof PlayerRole>;

// Language enum
export const Language = z.enum([
  "english",
  "swedish",
  "both"
]);

export type Language = z.infer<typeof Language>;

// Stroke data for canvas
export const StrokeDataSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  points: z.array(z.object({
    x: z.number(),
    y: z.number()
  })),
  color: z.string(),
  width: z.number(),
  tool: z.enum(["pencil", "brush", "eraser"]),
  timestamp: z.number()
});

export type StrokeData = z.infer<typeof StrokeDataSchema>;

// Player in game
export const PlayerSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatarInitials: z.string(),
  avatarColor: z.string(),
  isHost: z.boolean(),
  isReady: z.boolean(),
  isConnected: z.boolean(),
  isBot: z.boolean().default(false),
  lastActivity: z.number(),
  score: z.number(),
  role: PlayerRole.optional(),
  assignedWord: z.string().optional(),
  hasSubmittedDrawing: z.boolean(),
  guess: z.string().optional(),
  hasGuessed: z.boolean()
});

export type Player = z.infer<typeof PlayerSchema>;

// Room settings
export const RoomSettingsSchema = z.object({
  maxPlayers: z.number().min(4).max(12),
  rounds: z.number().min(3).max(10),
  roundTime: z.number().min(30).max(180),
  drawingTime: z.number().min(15).max(120),
  decoySimilarity: z.enum(["easy", "medium", "hard"]),
  wordPacks: z.array(WordCategory),
  language: Language,
  isPublic: z.boolean(),
  gameMode: GameMode,
  botsEnabled: z.boolean().default(false),
  botCount: z.number().min(0).max(8).default(0)
});

export type RoomSettings = z.infer<typeof RoomSettingsSchema>;

// Game mode specific data
export const GameModeDataSchema = z.object({
  // tool_lockout
  disabledTools: z.array(z.enum(["pencil", "brush", "eraser"])).optional(),
  // fog_of_war
  fogRadius: z.number().optional(),
  // stencil_zones
  allowedZones: z.array(z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() })).optional(),
  // camouflage_palette
  limitedColors: z.array(z.string()).optional(),
  // time_bomb
  nextClearTime: z.number().optional(),
  // relay_draw
  currentDrawerId: z.string().optional(),
  drawOrder: z.array(z.string()).optional(),
  // whisper_hints
  hints: z.array(z.string()).optional(),
  // sudden_death
  eliminatedPlayers: z.array(z.string()).optional(),
  // ping_pong_guess
  phaseToggleCount: z.number().optional(),
  maxPhaseToggles: z.number().optional()
}).optional();

export type GameModeData = z.infer<typeof GameModeDataSchema>;

// Round data
export const RoundDataSchema = z.object({
  roundNumber: z.number(),
  targetWord: z.string(),
  decoyWord: z.string(),
  category: WordCategory,
  startTime: z.number(),
  endTime: z.number().optional(),
  strokes: z.array(StrokeDataSchema),
  canvasSnapshots: z.record(z.string()), // playerId -> base64 image
  votes: z.record(z.string()), // voterId -> targetPlayerId
  results: z.object({
    correctGuesses: z.number(),
    deceiverSuccesses: z.number(),
    pointsAwarded: z.record(z.number()) // playerId -> points
  }).optional(),
  modeData: GameModeDataSchema
});

export type RoundData = z.infer<typeof RoundDataSchema>;

// Game room
export const GameRoomSchema = z.object({
  id: z.string(),
  code: z.string(),
  hostId: z.string(),
  settings: RoomSettingsSchema,
  players: z.array(PlayerSchema),
  phase: GamePhase,
  currentRound: z.number(),
  rounds: z.array(RoundDataSchema),
  createdAt: z.number(),
  startedAt: z.number().optional()
});

export type GameRoom = z.infer<typeof GameRoomSchema>;

// WebSocket message types
export const WSMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("join_room"),
    payload: z.object({
      roomCode: z.string(),
      username: z.string()
    })
  }),
  z.object({
    type: z.literal("create_room"),
    payload: z.object({
      username: z.string(),
      settings: RoomSettingsSchema
    })
  }),
  z.object({
    type: z.literal("update_settings"),
    payload: z.object({
      settings: RoomSettingsSchema
    })
  }),
  z.object({
    type: z.literal("toggle_ready"),
    payload: z.object({})
  }),
  z.object({
    type: z.literal("start_game"),
    payload: z.object({})
  }),
  z.object({
    type: z.literal("draw_stroke"),
    payload: z.object({
      stroke: StrokeDataSchema
    })
  }),
  z.object({
    type: z.literal("submit_drawing"),
    payload: z.object({
      canvasSnapshot: z.string()
    })
  }),
  z.object({
    type: z.literal("submit_guess"),
    payload: z.object({
      guess: z.string()
    })
  }),
  z.object({
    type: z.literal("vote_target"),
    payload: z.object({
      targetPlayerId: z.string()
    })
  }),
  z.object({
    type: z.literal("chat_message"),
    payload: z.object({
      message: z.string()
    })
  }),
  z.object({
    type: z.literal("leave_room"),
    payload: z.object({})
  }),
  z.object({
    type: z.literal("heartbeat"),
    payload: z.object({})
  })
]);

export type WSMessage = z.infer<typeof WSMessageSchema>;

// Chat message
export const ChatMessageSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  playerName: z.string(),
  message: z.string(),
  timestamp: z.number()
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Word pair for database
export const WordPairSchema = z.object({
  target: z.string(),
  decoys: z.object({
    easy: z.array(z.string()),
    medium: z.array(z.string()),
    hard: z.array(z.string())
  }),
  category: WordCategory,
  language: Language
});

export type WordPair = z.infer<typeof WordPairSchema>;
