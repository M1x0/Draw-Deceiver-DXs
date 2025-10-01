import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { gameManager } from "./game-manager";
import { WSMessageSchema, WSMessage } from "@shared/schema";
import { nanoid } from "nanoid";

interface ExtendedWebSocket extends WebSocket {
  playerId?: string;
  isAlive?: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server on /ws path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Heartbeat interval
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws: ExtendedWebSocket) => {
      if (ws.isAlive === false) {
        if (ws.playerId) {
          gameManager.removePlayer(ws.playerId);
          broadcastRoomUpdate(ws.playerId);
        }
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.isAlive = true;
    ws.playerId = nanoid();

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data: Buffer) => {
      try {
        const parsed = JSON.parse(data.toString());
        const result = WSMessageSchema.safeParse(parsed);

        if (!result.success) {
          ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid message format' } }));
          return;
        }

        const message = result.data;
        handleWebSocketMessage(ws, message);
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Failed to parse message' } }));
      }
    });

    ws.on('close', () => {
      if (ws.playerId) {
        gameManager.removePlayer(ws.playerId);
        broadcastRoomUpdate(ws.playerId);
      }
    });

    // Send connection success
    ws.send(JSON.stringify({
      type: 'connected',
      payload: { playerId: ws.playerId }
    }));
  });

  function handleWebSocketMessage(ws: ExtendedWebSocket, message: WSMessage) {
    if (!ws.playerId) return;

    gameManager.updatePlayerActivity(ws.playerId);

    switch (message.type) {
      case 'create_room': {
        const room = gameManager.createRoom(
          ws.playerId,
          message.payload.username,
          message.payload.settings
        );
        ws.send(JSON.stringify({
          type: 'room_created',
          payload: { room }
        }));
        break;
      }

      case 'join_room': {
        const room = gameManager.joinRoom(
          ws.playerId,
          message.payload.username,
          message.payload.roomCode
        );
        if (room) {
          ws.send(JSON.stringify({
            type: 'room_joined',
            payload: { room }
          }));
          broadcastToRoom(room.id, {
            type: 'player_joined',
            payload: { room }
          });
        } else {
          ws.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Room not found or full' }
          }));
        }
        break;
      }

      case 'update_settings': {
        const room = gameManager.getRoomByPlayerId(ws.playerId);
        if (room && room.hostId === ws.playerId) {
          gameManager.updateSettings(room.id, message.payload.settings);
          // Broadcast full room state to include added/removed bot players
          broadcastToRoom(room.id, {
            type: 'room_updated',
            payload: { room }
          });
        }
        break;
      }

      case 'toggle_ready': {
        gameManager.toggleReady(ws.playerId);
        broadcastRoomUpdate(ws.playerId);
        break;
      }

      case 'start_game': {
        const room = gameManager.getRoomByPlayerId(ws.playerId);
        if (room && room.hostId === ws.playerId) {
          if (gameManager.startGame(room.id)) {
            const updatedRoom = gameManager.getRoomByPlayerId(ws.playerId);
            broadcastToRoom(room.id, {
              type: 'game_started',
              payload: { room: updatedRoom }
            });
          }
        }
        break;
      }

      case 'draw_stroke': {
        if (gameManager.addStroke(ws.playerId, message.payload.stroke)) {
          const room = gameManager.getRoomByPlayerId(ws.playerId);
          if (room) {
            broadcastToRoom(room.id, {
              type: 'stroke_added',
              payload: { stroke: message.payload.stroke }
            }, ws.playerId);
          }
        }
        break;
      }

      case 'submit_drawing': {
        gameManager.submitDrawing(ws.playerId, message.payload.canvasSnapshot);
        broadcastRoomUpdate(ws.playerId);
        break;
      }

      case 'submit_guess': {
        gameManager.submitGuess(ws.playerId, message.payload.guess);
        broadcastRoomUpdate(ws.playerId);
        break;
      }

      case 'vote_target': {
        gameManager.voteTarget(ws.playerId, message.payload.targetPlayerId);
        broadcastRoomUpdate(ws.playerId);
        break;
      }

      case 'chat_message': {
        const chatMessage = gameManager.addChatMessage(ws.playerId, message.payload.message);
        if (chatMessage) {
          const room = gameManager.getRoomByPlayerId(ws.playerId);
          if (room) {
            broadcastToRoom(room.id, {
              type: 'chat_message',
              payload: { message: chatMessage }
            });
          }
        }
        break;
      }

      case 'leave_room': {
        gameManager.removePlayer(ws.playerId);
        broadcastRoomUpdate(ws.playerId);
        ws.send(JSON.stringify({
          type: 'left_room',
          payload: {}
        }));
        break;
      }

      case 'heartbeat': {
        gameManager.updatePlayerActivity(ws.playerId);
        break;
      }
    }
  }

  function broadcastRoomUpdate(playerId: string) {
    const room = gameManager.getRoomByPlayerId(playerId);
    if (room) {
      broadcastToRoom(room.id, {
        type: 'room_updated',
        payload: { room }
      });
    }
  }

  function broadcastToRoom(roomId: string, message: any, excludePlayerId?: string) {
    const room = gameManager.getAllRooms().find(r => r.id === roomId);
    if (!room) return;

    wss.clients.forEach((client: ExtendedWebSocket) => {
      if (
        client.readyState === WebSocket.OPEN &&
        client.playerId &&
        room.players.some(p => p.id === client.playerId) &&
        client.playerId !== excludePlayerId
      ) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // REST API endpoints for initial data
  app.get('/api/rooms', (_req, res) => {
    const rooms = gameManager.getAllRooms()
      .filter(r => r.settings.isPublic && r.phase === 'lobby')
      .map(r => ({
        code: r.code,
        players: r.players.length,
        maxPlayers: r.settings.maxPlayers,
        gameMode: r.settings.gameMode
      }));
    res.json(rooms);
  });

  return httpServer;
}
