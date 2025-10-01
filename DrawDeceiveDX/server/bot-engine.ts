import { nanoid } from "nanoid";
import { StrokeData, Player, GameRoom } from "@shared/schema";

export class BotEngine {
  private roomId: string;
  private drawTimers: Map<string, NodeJS.Timeout> = new Map();
  private guessTimers: Map<string, NodeJS.Timeout> = new Map();
  private voteTimers: Map<string, NodeJS.Timeout> = new Map();
  private drawIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  cleanup() {
    this.drawTimers.forEach(timer => clearTimeout(timer));
    this.guessTimers.forEach(timer => clearTimeout(timer));
    this.voteTimers.forEach(timer => clearTimeout(timer));
    this.drawIntervals.forEach(interval => clearInterval(interval));
    this.drawTimers.clear();
    this.guessTimers.clear();
    this.voteTimers.clear();
    this.drawIntervals.clear();
  }

  startBotDrawing(
    bot: Player,
    room: GameRoom,
    onStroke: (botId: string, stroke: StrokeData) => void,
    onSubmit: (botId: string, canvasSnapshot: string) => void
  ) {
    const currentRound = room.rounds[room.currentRound - 1];
    if (!currentRound) return;

    const gameMode = room.settings.gameMode;
    const modeData = currentRound.modeData;

    if (gameMode === "relay_draw") {
      if (modeData?.currentDrawerId !== bot.id) {
        return;
      }
    }

    const drawDuration = Math.random() * 5000 + 3000;
    const strokeCount = Math.floor(Math.random() * 8) + 4;
    let strokes = 0;

    const interval = setInterval(() => {
      if (strokes >= strokeCount) {
        clearInterval(interval);
        this.drawIntervals.delete(bot.id);
        
        setTimeout(() => {
          const placeholderSnapshot = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
          onSubmit(bot.id, placeholderSnapshot);
        }, 500);
        return;
      }

      const stroke = this.generateStroke(bot, room);
      onStroke(bot.id, stroke);
      strokes++;
    }, drawDuration / strokeCount);

    this.drawIntervals.set(bot.id, interval);
  }

  private generateStroke(bot: Player, room: GameRoom): StrokeData {
    const currentRound = room.rounds[room.currentRound - 1];
    const gameMode = room.settings.gameMode;
    const modeData = currentRound?.modeData;

    const patternType = Math.floor(Math.random() * 3);
    let points: { x: number; y: number }[] = [];
    
    const canvasWidth = 800;
    const canvasHeight = 600;

    if (gameMode === "stencil_zones" && modeData?.allowedZones && modeData.allowedZones.length > 0) {
      const zone = modeData.allowedZones[Math.floor(Math.random() * modeData.allowedZones.length)];
      const startX = zone.x + Math.random() * zone.width;
      const startY = zone.y + Math.random() * zone.height;
      
      if (patternType === 0) {
        points = this.generateSquiggle(startX, startY, zone);
      } else {
        points = this.generateLine(startX, startY, zone);
      }
    } else {
      const startX = Math.random() * canvasWidth;
      const startY = Math.random() * canvasHeight;

      if (patternType === 0) {
        points = this.generateSquiggle(startX, startY);
      } else if (patternType === 1) {
        points = this.generateCircle(startX, startY);
      } else {
        points = this.generateLine(startX, startY);
      }
    }

    const toolOptions = ["pencil", "brush"] as const;
    let tool: "pencil" | "brush" | "eraser" = toolOptions[Math.floor(Math.random() * toolOptions.length)];
    
    if (gameMode === "tool_lockout" && modeData?.disabledTools) {
      const availableTools = toolOptions.filter(t => !modeData.disabledTools?.includes(t));
      if (availableTools.length > 0) {
        tool = availableTools[Math.floor(Math.random() * availableTools.length)];
      }
    }

    const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];
    let color = colors[Math.floor(Math.random() * colors.length)];
    
    if (gameMode === "camouflage_palette" && modeData?.limitedColors && modeData.limitedColors.length > 0) {
      color = modeData.limitedColors[Math.floor(Math.random() * modeData.limitedColors.length)];
    }

    return {
      id: nanoid(),
      playerId: bot.id,
      points,
      color,
      width: Math.random() * 3 + 2,
      tool,
      timestamp: Date.now()
    };
  }

  private generateSquiggle(startX: number, startY: number, zone?: { x: number; y: number; width: number; height: number }): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    let x = startX;
    let y = startY;
    const steps = Math.floor(Math.random() * 15) + 10;

    for (let i = 0; i < steps; i++) {
      points.push({ x, y });
      x += (Math.random() - 0.5) * 30;
      y += (Math.random() - 0.5) * 30;

      if (zone) {
        x = Math.max(zone.x, Math.min(zone.x + zone.width, x));
        y = Math.max(zone.y, Math.min(zone.y + zone.height, y));
      } else {
        x = Math.max(0, Math.min(800, x));
        y = Math.max(0, Math.min(600, y));
      }
    }

    return points;
  }

  private generateCircle(centerX: number, centerY: number): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const radius = Math.random() * 50 + 20;
    const steps = 30;

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }

    return points;
  }

  private generateLine(startX: number, startY: number, zone?: { x: number; y: number; width: number; height: number }): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    
    let endX, endY;
    if (zone) {
      endX = zone.x + Math.random() * zone.width;
      endY = zone.y + Math.random() * zone.height;
    } else {
      endX = Math.random() * 800;
      endY = Math.random() * 600;
    }

    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push({
        x: startX + (endX - startX) * t,
        y: startY + (endY - startY) * t
      });
    }

    return points;
  }

  startBotGuessing(
    bot: Player,
    room: GameRoom,
    onGuess: (botId: string, guess: string) => void
  ) {
    const currentRound = room.rounds[room.currentRound - 1];
    if (!currentRound) return;

    const eliminatedPlayers = currentRound.modeData?.eliminatedPlayers || [];
    if (eliminatedPlayers.includes(bot.id)) {
      return;
    }

    const delay = Math.random() * 4000 + 1000;

    const timer = setTimeout(() => {
      let guess: string;
      const correctGuessChance = Math.random();
      
      if (bot.role === "target") {
        guess = correctGuessChance < 0.75 ? currentRound.targetWord : currentRound.decoyWord;
      } else {
        guess = correctGuessChance < 0.75 ? currentRound.decoyWord : currentRound.targetWord;
      }

      onGuess(bot.id, guess);
      this.guessTimers.delete(bot.id);
    }, delay);

    this.guessTimers.set(bot.id, timer);
  }

  startBotVoting(
    bot: Player,
    room: GameRoom,
    onVote: (botId: string, targetId: string) => void
  ) {
    const delay = Math.random() * 3000 + 1000;

    const timer = setTimeout(() => {
      const eligibleTargets = room.players.filter(p => 
        p.id !== bot.id && 
        p.isConnected &&
        !p.isBot
      );

      if (eligibleTargets.length > 0) {
        const randomTarget = eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
        onVote(bot.id, randomTarget.id);
      }

      this.voteTimers.delete(bot.id);
    }, delay);

    this.voteTimers.set(bot.id, timer);
  }

  clearBotTimers(botId: string) {
    const drawTimer = this.drawTimers.get(botId);
    const guessTimer = this.guessTimers.get(botId);
    const voteTimer = this.voteTimers.get(botId);
    const drawInterval = this.drawIntervals.get(botId);

    if (drawTimer) clearTimeout(drawTimer);
    if (guessTimer) clearTimeout(guessTimer);
    if (voteTimer) clearTimeout(voteTimer);
    if (drawInterval) clearInterval(drawInterval);

    this.drawTimers.delete(botId);
    this.guessTimers.delete(botId);
    this.voteTimers.delete(botId);
    this.drawIntervals.delete(botId);
  }
}
