import { WSMessage, GameRoom, Player, StrokeData, ChatMessage } from "@shared/schema";

export type WSCallback = (data: any) => void;

export class GameWebSocket {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<WSCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  public playerId: string | null = null;
  public currentRoom: GameRoom | null = null;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connected') {
            this.playerId = data.payload.playerId;
            resolve();
          }

          this.emit(data.type, data.payload);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.attemptReconnect();
      };
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('connection_lost', {});
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  send(message: WSMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  on(event: string, callback: WSCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: WSCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    // Store room data for events that contain it
    if (event === 'room_created' || event === 'room_joined' || event === 'room_updated' || 
        event === 'player_joined' || event === 'game_started' || event === 'settings_updated') {
      if (data.room) {
        this.currentRoom = data.room;
      }
    }

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  close() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Helper methods for common actions
  createRoom(username: string, settings: GameRoom["settings"]) {
    this.send({
      type: "create_room",
      payload: { username, settings }
    });
  }

  joinRoom(roomCode: string, username: string) {
    this.send({
      type: "join_room",
      payload: { roomCode, username }
    });
  }

  updateSettings(settings: GameRoom["settings"]) {
    this.send({
      type: "update_settings",
      payload: { settings }
    });
  }

  toggleReady() {
    this.send({
      type: "toggle_ready",
      payload: {}
    });
  }

  startGame() {
    this.send({
      type: "start_game",
      payload: {}
    });
  }

  drawStroke(stroke: StrokeData) {
    this.send({
      type: "draw_stroke",
      payload: { stroke }
    });
  }

  submitDrawing(canvasSnapshot: string) {
    this.send({
      type: "submit_drawing",
      payload: { canvasSnapshot }
    });
  }

  submitGuess(guess: string) {
    this.send({
      type: "submit_guess",
      payload: { guess }
    });
  }

  voteTarget(targetPlayerId: string) {
    this.send({
      type: "vote_target",
      payload: { targetPlayerId }
    });
  }

  sendChatMessage(message: string) {
    this.send({
      type: "chat_message",
      payload: { message }
    });
  }

  leaveRoom() {
    this.send({
      type: "leave_room",
      payload: {}
    });
  }

  sendHeartbeat() {
    this.send({
      type: "heartbeat",
      payload: {}
    });
  }
}

export const gameWebSocket = new GameWebSocket();
