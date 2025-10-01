import { GameRoom, Player, RoundData, GamePhase, PlayerRole, StrokeData, ChatMessage, GameModeData } from "@shared/schema";
import { getRandomWordPair } from "./word-database";
import { nanoid } from "nanoid";
import { BotEngine } from "./bot-engine";

export class GameManager {
  private rooms: Map<string, GameRoom> = new Map();
  private playerRooms: Map<string, string> = new Map(); // playerId -> roomId
  private chatMessages: Map<string, ChatMessage[]> = new Map(); // roomId -> messages
  private botEngines: Map<string, BotEngine> = new Map(); // roomId -> BotEngine

  generateRoomCode(): string {
    let code: string;
    do {
      code = nanoid(6).toUpperCase();
    } while (this.getRoomByCode(code));
    return code;
  }

  createRoom(hostId: string, username: string, settings: GameRoom["settings"]): GameRoom {
    const roomId = nanoid();
    const code = this.generateRoomCode();
    
    const host: Player = {
      id: hostId,
      username,
      avatarInitials: this.getInitials(username),
      avatarColor: this.getRandomColor(),
      isHost: true,
      isReady: true,
      isConnected: true,
      isBot: false,
      lastActivity: Date.now(),
      score: 0,
      hasSubmittedDrawing: false,
      hasGuessed: false
    };

    // Ensure bot settings have defaults
    const roomSettings = {
      ...settings,
      botsEnabled: settings.botsEnabled ?? false,
      botCount: settings.botCount ?? 0
    };

    const room: GameRoom = {
      id: roomId,
      code,
      hostId,
      settings: roomSettings,
      players: [host],
      phase: "lobby",
      currentRound: 0,
      rounds: [],
      createdAt: Date.now()
    };

    this.rooms.set(roomId, room);
    this.playerRooms.set(hostId, roomId);
    this.chatMessages.set(roomId, []);

    return room;
  }

  joinRoom(playerId: string, username: string, code: string): GameRoom | null {
    const room = this.getRoomByCode(code);
    if (!room) return null;

    if (room.phase !== "lobby") return null;
    if (room.players.length >= room.settings.maxPlayers) return null;
    if (room.players.some(p => p.id === playerId)) return null;

    const player: Player = {
      id: playerId,
      username,
      avatarInitials: this.getInitials(username),
      avatarColor: this.getRandomColor(),
      isHost: false,
      isReady: false,
      isConnected: true,
      isBot: false,
      lastActivity: Date.now(),
      score: 0,
      hasSubmittedDrawing: false,
      hasGuessed: false
    };

    room.players.push(player);
    this.playerRooms.set(playerId, room.id);

    return room;
  }

  addBots(roomId: string, count: number): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.phase !== "lobby") return false;

    const availableSlots = room.settings.maxPlayers - room.players.length;
    const botsToAdd = Math.min(count, availableSlots);

    for (let i = 0; i < botsToAdd; i++) {
      const botId = `bot-${nanoid(8)}`;
      const botNames = ["Pixel", "Sketch", "Doodle", "Canvas", "Brush", "Ink", "Shade", "Line"];
      const randomName = botNames[Math.floor(Math.random() * botNames.length)];
      
      const bot: Player = {
        id: botId,
        username: `Bot ${randomName}-${i + 1}`,
        avatarInitials: randomName.slice(0, 2).toUpperCase(),
        avatarColor: this.getRandomColor(),
        isHost: false,
        isReady: true,
        isConnected: true,
        isBot: true,
        lastActivity: Date.now(),
        score: 0,
        hasSubmittedDrawing: false,
        hasGuessed: false
      };

      room.players.push(bot);
      this.playerRooms.set(botId, room.id);
    }

    if (!this.botEngines.has(roomId)) {
      this.botEngines.set(roomId, new BotEngine(roomId));
    }

    return true;
  }

  removeBots(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.phase !== "lobby") return false;

    const bots = room.players.filter(p => p.isBot);
    
    bots.forEach(bot => {
      this.playerRooms.delete(bot.id);
    });

    room.players = room.players.filter(p => !p.isBot);

    const botEngine = this.botEngines.get(roomId);
    if (botEngine) {
      botEngine.cleanup();
      this.botEngines.delete(roomId);
    }

    return true;
  }

  getRoomByCode(code: string): GameRoom | null {
    for (const room of Array.from(this.rooms.values())) {
      if (room.code === code) return room;
    }
    return null;
  }

  getRoomByPlayerId(playerId: string): GameRoom | null {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;
    return this.rooms.get(roomId) || null;
  }

  updateSettings(roomId: string, settings: GameRoom["settings"]): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.phase !== "lobby") return false;
    
    const previousBotsEnabled = room.settings.botsEnabled;
    const previousBotCount = room.settings.botCount;
    
    room.settings = settings;
    
    // Handle bot changes
    if (settings.botsEnabled && !previousBotsEnabled) {
      this.addBots(roomId, settings.botCount);
    } else if (!settings.botsEnabled && previousBotsEnabled) {
      this.removeBots(roomId);
    } else if (settings.botsEnabled && settings.botCount !== previousBotCount) {
      this.removeBots(roomId);
      this.addBots(roomId, settings.botCount);
    }
    
    return true;
  }

  toggleReady(playerId: string): boolean {
    const room = this.getRoomByPlayerId(playerId);
    if (!room || room.phase !== "lobby") return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player || player.isHost) return false;

    player.isReady = !player.isReady;
    return true;
  }

  canStartGame(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.phase !== "lobby") return false;
    if (room.players.length < 2) return false;
    // Non-host human players must be ready; bots are always ready
    return room.players.filter(p => !p.isHost && !p.isBot).every(p => p.isReady);
  }

  startGame(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || !this.canStartGame(roomId)) return false;

    room.startedAt = Date.now();
    this.startNewRound(roomId);
    return true;
  }

  startNewRound(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.currentRound++;
    
    // Get word pair
    const wordPair = getRandomWordPair(
      room.settings.wordPacks,
      room.settings.language,
      room.settings.decoySimilarity
    );
    
    if (!wordPair) return false;

    // Assign roles
    const players = [...room.players];
    const deceiverCount = room.settings.gameMode === "double_deceiver" ? 2 : 1;
    
    // Shuffle players
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }

    // Assign deceivers
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (i < deceiverCount) {
        player.role = "deceiver";
        player.assignedWord = wordPair.decoy;
      } else {
        player.role = "target";
        player.assignedWord = wordPair.target;
      }
      player.hasSubmittedDrawing = false;
      player.hasGuessed = false;
      player.guess = undefined;
    }

    // Initialize mode-specific data
    const modeData = this.initializeModeData(room.settings.gameMode, room.players);

    const round: RoundData = {
      roundNumber: room.currentRound,
      targetWord: wordPair.target,
      decoyWord: wordPair.decoy,
      category: wordPair.category,
      startTime: Date.now(),
      strokes: [],
      canvasSnapshots: {},
      votes: {},
      modeData
    };

    room.rounds.push(round);
    room.phase = "drawing";

    // Setup time bomb interval if needed
    if (room.settings.gameMode === "time_bomb") {
      this.setupTimeBombInterval(room.id);
    }

    // Trigger bot drawing
    const botEngine = this.botEngines.get(room.id);
    if (botEngine) {
      const bots = room.players.filter(p => p.isBot);
      bots.forEach(bot => {
        botEngine.startBotDrawing(
          bot,
          room,
          (botId, stroke) => {
            this.addStroke(botId, stroke);
          },
          (botId, snapshot) => {
            this.submitDrawing(botId, snapshot);
          }
        );
      });
    }

    return true;
  }

  private initializeModeData(gameMode: string, players: Player[]): GameModeData {
    const modeData: GameModeData = {};

    switch (gameMode) {
      case "tool_lockout": {
        // Randomly disable 1-2 tools
        const allTools: ("pencil" | "brush" | "eraser")[] = ["pencil", "brush", "eraser"];
        const disableCount = Math.random() > 0.5 ? 1 : 2;
        const shuffled = [...allTools].sort(() => Math.random() - 0.5);
        modeData.disabledTools = shuffled.slice(0, disableCount);
        break;
      }

      case "fog_of_war": {
        // Limited visibility radius around cursor
        modeData.fogRadius = 100;
        break;
      }

      case "stencil_zones": {
        // Define 3-4 random zones where drawing is allowed
        const zoneCount = 3 + Math.floor(Math.random() * 2);
        modeData.allowedZones = [];
        for (let i = 0; i < zoneCount; i++) {
          modeData.allowedZones.push({
            x: Math.random() * 600,
            y: Math.random() * 400,
            width: 100 + Math.random() * 100,
            height: 100 + Math.random() * 100
          });
        }
        break;
      }

      case "camouflage_palette": {
        // Limit to 3-4 random similar colors
        const similarColorSets = [
          ["#FF6B6B", "#FF8787", "#FFA5A5", "#FFC2C2"], // Reds
          ["#4ECDC4", "#45B7AA", "#3DA99F", "#359B94"], // Teals
          ["#FFE66D", "#FFD93D", "#FFCC00", "#F5C400"], // Yellows
          ["#95E1D3", "#81D5C5", "#6DC9B7", "#59BDA9"], // Mint greens
          ["#A8E6CF", "#8DD9BF", "#72CCAF", "#57BF9F"]  // Light greens
        ];
        const selectedSet = similarColorSets[Math.floor(Math.random() * similarColorSets.length)];
        modeData.limitedColors = selectedSet.slice(0, 3 + Math.floor(Math.random() * 2));
        break;
      }

      case "time_bomb": {
        // Set first clear time (5-15 seconds from now)
        modeData.nextClearTime = Date.now() + 5000 + Math.random() * 10000;
        break;
      }

      case "relay_draw": {
        // Shuffle player order for relay
        const shuffled = [...players].sort(() => Math.random() - 0.5);
        modeData.drawOrder = shuffled.map(p => p.id);
        modeData.currentDrawerId = shuffled[0].id;
        break;
      }

      case "whisper_hints": {
        // Generate cryptic hints based on target word - keep them vague but helpful
        modeData.hints = this.generateCrypticHints();
        break;
      }

      case "sudden_death": {
        // Track eliminated players
        modeData.eliminatedPlayers = [];
        break;
      }

      case "ping_pong_guess": {
        // Track phase toggles
        modeData.phaseToggleCount = 0;
        modeData.maxPhaseToggles = 4; // 2 drawing, 2 guessing phases
        break;
      }
    }

    return modeData;
  }

  private generateCrypticHints(): string[] {
    const hintTemplates = [
      "Look for the most detailed strokes",
      "Pay attention to confidence in the lines",
      "The deceiver may hesitate more",
      "Watch for unusual drawing patterns",
      "Trust your first instinct",
      "Look at the overall composition",
      "The target knows what they're drawing"
    ];
    
    // Return 2-3 random hints
    const count = 2 + Math.floor(Math.random() * 2);
    const shuffled = [...hintTemplates].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private timeBombIntervals: Map<string, NodeJS.Timeout> = new Map();

  private setupTimeBombInterval(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room || room.settings.gameMode !== "time_bomb") return;

    // Clear existing interval if any
    const existingInterval = this.timeBombIntervals.get(room.id);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Check every second if it's time to clear
    const interval = setInterval(() => {
      if (room.phase !== "drawing") {
        clearInterval(interval);
        this.timeBombIntervals.delete(room.id);
        return;
      }

      const currentRound = room.rounds[room.currentRound - 1];
      if (!currentRound?.modeData?.nextClearTime) {
        clearInterval(interval);
        this.timeBombIntervals.delete(room.id);
        return;
      }

      // Check if it's time to clear
      if (Date.now() >= currentRound.modeData.nextClearTime) {
        // Clear all strokes
        currentRound.strokes = [];
        // Schedule next clear (5-15 seconds from now)
        currentRound.modeData.nextClearTime = Date.now() + 5000 + Math.random() * 10000;
      }
    }, 1000);

    this.timeBombIntervals.set(room.id, interval);
  }

  addStroke(playerId: string, stroke: StrokeData): boolean {
    const room = this.getRoomByPlayerId(playerId);
    if (!room || room.phase !== "drawing") return false;

    const currentRound = room.rounds[room.currentRound - 1];
    if (!currentRound) return false;

    // Stroke throttling check
    const recentStrokes = currentRound.strokes.filter(
      s => s.playerId === playerId && Date.now() - s.timestamp < 1000
    );
    if (recentStrokes.length >= 60) return false;

    currentRound.strokes.push(stroke);
    return true;
  }

  submitDrawing(playerId: string, canvasSnapshot: string): boolean {
    const room = this.getRoomByPlayerId(playerId);
    if (!room || room.phase !== "drawing") return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    const currentRound = room.rounds[room.currentRound - 1];
    if (!currentRound) return false;

    player.hasSubmittedDrawing = true;
    currentRound.canvasSnapshots[playerId] = canvasSnapshot;

    // Relay draw mode: advance to next drawer
    if (room.settings.gameMode === "relay_draw" && currentRound.modeData?.drawOrder) {
      const currentIndex = currentRound.modeData.drawOrder.indexOf(playerId);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < currentRound.modeData.drawOrder.length) {
        // Move to next drawer
        currentRound.modeData.currentDrawerId = currentRound.modeData.drawOrder[nextIndex];
        // Reset hasSubmittedDrawing for next player
        const nextPlayer = room.players.find(p => p.id === currentRound.modeData?.currentDrawerId);
        if (nextPlayer) {
          nextPlayer.hasSubmittedDrawing = false;
        }
        return true; // Don't check allSubmitted yet in relay mode
      }
    }

    // Check if all players submitted
    if (room.players.every(p => p.hasSubmittedDrawing)) {
      this.startGuessingPhase(room.id);
    }

    return true;
  }

  startGuessingPhase(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    const currentRound = room.rounds[room.currentRound - 1];
    
    // Ping pong guess mode: alternate between drawing and guessing
    if (room.settings.gameMode === "ping_pong_guess" && currentRound?.modeData) {
      if (!currentRound.modeData.phaseToggleCount) {
        currentRound.modeData.phaseToggleCount = 0;
      }
      currentRound.modeData.phaseToggleCount++;
    }
    
    room.phase = "guessing";

    // Trigger bot guessing
    const botEngine = this.botEngines.get(room.id);
    if (botEngine) {
      const bots = room.players.filter(p => p.isBot);
      bots.forEach(bot => {
        botEngine.startBotGuessing(
          bot,
          room,
          (botId, guess) => {
            this.submitGuess(botId, guess);
          }
        );
      });
    }
  }

  submitGuess(playerId: string, guess: string): boolean {
    const room = this.getRoomByPlayerId(playerId);
    if (!room || room.phase !== "guessing") return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    const currentRound = room.rounds[room.currentRound - 1];
    if (!currentRound) return false;

    player.guess = guess;
    player.hasGuessed = true;

    // Sudden death mode: eliminate player if wrong guess
    if (room.settings.gameMode === "sudden_death" && currentRound.modeData) {
      const isCorrect = guess.toLowerCase().trim() === currentRound.targetWord.toLowerCase().trim();
      if (!isCorrect) {
        if (!currentRound.modeData.eliminatedPlayers) {
          currentRound.modeData.eliminatedPlayers = [];
        }
        if (!currentRound.modeData.eliminatedPlayers.includes(playerId)) {
          currentRound.modeData.eliminatedPlayers.push(playerId);
        }
      }
    }

    // Check if all players guessed
    if (room.players.every(p => p.hasGuessed)) {
      this.calculateRoundResults(room.id);
    }

    return true;
  }

  voteTarget(voterId: string, targetPlayerId: string): boolean {
    const room = this.getRoomByPlayerId(voterId);
    if (!room || room.phase !== "guessing") return false;

    const currentRound = room.rounds[room.currentRound - 1];
    if (!currentRound) return false;

    currentRound.votes[voterId] = targetPlayerId;

    // Check if all players voted
    if (Object.keys(currentRound.votes).length === room.players.length) {
      // Ping pong guess mode: alternate back to drawing if not done
      if (room.settings.gameMode === "ping_pong_guess" && currentRound.modeData) {
        const toggleCount = currentRound.modeData.phaseToggleCount || 0;
        const maxToggles = currentRound.modeData.maxPhaseToggles || 4;
        
        if (toggleCount < maxToggles) {
          // Reset for next drawing phase
          room.players.forEach(p => {
            p.hasSubmittedDrawing = false;
            p.hasGuessed = false;
            p.guess = undefined;
          });
          currentRound.votes = {};
          currentRound.modeData.phaseToggleCount = toggleCount + 1;
          room.phase = "drawing";
          return true;
        }
      }
      
      this.calculateRoundResults(room.id);
    }

    return true;
  }

  calculateRoundResults(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const currentRound = room.rounds[room.currentRound - 1];
    if (!currentRound) return;

    const deceivers = room.players.filter(p => p.role === "deceiver");
    const targets = room.players.filter(p => p.role === "target");

    let correctGuesses = 0;
    let deceiverSuccesses = 0;
    const pointsAwarded: Record<string, number> = {};

    // Initialize points
    room.players.forEach(p => {
      pointsAwarded[p.id] = 0;
    });

    // Count votes for deceivers vs targets
    Object.values(currentRound.votes).forEach(votedPlayerId => {
      const votedPlayer = room.players.find(p => p.id === votedPlayerId);
      if (votedPlayer?.role === "target") {
        correctGuesses++;
      } else if (votedPlayer?.role === "deceiver") {
        deceiverSuccesses++;
      }
    });

    // Award points
    // Targets get points for correct identifications
    targets.forEach(target => {
      const votesReceived = Object.values(currentRound.votes).filter(
        v => v === target.id
      ).length;
      pointsAwarded[target.id] = votesReceived * 100;
    });

    // Deceivers get points for successful deceptions
    deceivers.forEach(deceiver => {
      const votesReceived = Object.values(currentRound.votes).filter(
        v => v === deceiver.id
      ).length;
      pointsAwarded[deceiver.id] = votesReceived * 150;
    });

    // Update player scores
    room.players.forEach(player => {
      player.score += pointsAwarded[player.id] || 0;
    });

    currentRound.results = {
      correctGuesses,
      deceiverSuccesses,
      pointsAwarded
    };
    currentRound.endTime = Date.now();

    room.phase = "round_end";

    // Move to next round or end game
    setTimeout(() => {
      if (room.currentRound >= room.settings.rounds) {
        room.phase = "results";
      } else {
        this.startNewRound(roomId);
      }
    }, 5000);
  }

  updatePlayerActivity(playerId: string): void {
    const room = this.getRoomByPlayerId(playerId);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.lastActivity = Date.now();
      player.isConnected = true;
    }
  }

  checkAFK(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const now = Date.now();
    const afkThreshold = 60000; // 60 seconds

    room.players.forEach(player => {
      if (now - player.lastActivity > afkThreshold) {
        player.isConnected = false;
      }
    });
  }

  removePlayer(playerId: string): boolean {
    const room = this.getRoomByPlayerId(playerId);
    if (!room) return false;

    room.players = room.players.filter(p => p.id !== playerId);
    this.playerRooms.delete(playerId);

    // If host left, assign new host
    if (room.hostId === playerId && room.players.length > 0) {
      const newHost = room.players[0];
      newHost.isHost = true;
      newHost.isReady = true;
      room.hostId = newHost.id;
    }

    // If no players left, delete room
    if (room.players.length === 0) {
      this.rooms.delete(room.id);
      this.chatMessages.delete(room.id);
    }

    return true;
  }

  addChatMessage(playerId: string, message: string): ChatMessage | null {
    const room = this.getRoomByPlayerId(playerId);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return null;

    const chatMessage: ChatMessage = {
      id: nanoid(),
      playerId,
      playerName: player.username,
      message,
      timestamp: Date.now()
    };

    const messages = this.chatMessages.get(room.id) || [];
    messages.push(chatMessage);
    
    // Keep only last 100 messages
    if (messages.length > 100) {
      messages.shift();
    }
    
    this.chatMessages.set(room.id, messages);

    return chatMessage;
  }

  getChatMessages(roomId: string): ChatMessage[] {
    return this.chatMessages.get(roomId) || [];
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  private getRandomColor(): string {
    const colors = [
      "#6C5CE7", "#A29BFE", "#00CEC9", "#81ECEC", "#FDCB6E",
      "#FF7675", "#FD79A8", "#00B894", "#55EFC4", "#74B9FF"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getAllRooms(): GameRoom[] {
    return Array.from(this.rooms.values());
  }
}

export const gameManager = new GameManager();
