import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { gameWebSocket } from "@/lib/websocket";
import { GameRoom, GamePhase, Player, ChatMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import LobbySettings from "@/components/lobby/lobby-settings";
import PlayerList from "@/components/lobby/player-list";
import Chat from "@/components/lobby/chat";
import DrawingCanvas from "@/components/game/drawing-canvas";
import GuessingPhase from "@/components/game/guessing-phase";
import Results from "@/components/game/results";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import AnimatedBackground from "@/components/ui/animated-background";

export default function Game() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [room, setRoom] = useState<GameRoom | null>(gameWebSocket.currentRoom);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    // If no room data, redirect to home
    if (!gameWebSocket.currentRoom && !room) {
      setLocation("/");
      return;
    }

    // Define event handlers
    const handleRoomCreated = (data: any) => {
      setRoom(data.room);
    };

    const handleRoomJoined = (data: any) => {
      setRoom(data.room);
    };

    const handleRoomUpdated = (data: any) => {
      setRoom(data.room);
    };

    const handleSettingsUpdated = (data: any) => {
      setRoom((currentRoom) => currentRoom ? { ...currentRoom, settings: data.settings } : null);
    };

    const handlePlayerJoined = (data: any) => {
      setRoom(data.room);
      toast({
        title: "Player joined",
        description: `${data.room.players[data.room.players.length - 1].username} joined the room`
      });
    };

    const handleGameStarted = (data: any) => {
      setRoom(data.room);
      toast({
        title: "Game started!",
        description: "Get ready to draw!"
      });
    };

    const handleDrawingSubmitted = (data: any) => {
      toast({
        title: "Drawing submitted",
        description: "A player has submitted their drawing"
      });
    };

    const handleChatMessage = (data: any) => {
      setChatMessages(prev => [...prev, data.message]);
    };

    const handleConnectionLost = () => {
      toast({
        title: "Connection lost",
        description: "Attempting to reconnect...",
        variant: "destructive"
      });
    };

    const handleError = (data: any) => {
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive"
      });
    };

    // Subscribe to WebSocket events
    gameWebSocket.on("room_created", handleRoomCreated);
    gameWebSocket.on("room_joined", handleRoomJoined);
    gameWebSocket.on("room_updated", handleRoomUpdated);
    gameWebSocket.on("settings_updated", handleSettingsUpdated);
    gameWebSocket.on("player_joined", handlePlayerJoined);
    gameWebSocket.on("game_started", handleGameStarted);
    gameWebSocket.on("drawing_submitted", handleDrawingSubmitted);
    gameWebSocket.on("chat_message", handleChatMessage);
    gameWebSocket.on("connection_lost", handleConnectionLost);
    gameWebSocket.on("error", handleError);

    // Heartbeat every 10 seconds
    const heartbeatInterval = setInterval(() => {
      gameWebSocket.sendHeartbeat();
    }, 10000);

    return () => {
      // Remove event listeners
      gameWebSocket.off("room_created", handleRoomCreated);
      gameWebSocket.off("room_joined", handleRoomJoined);
      gameWebSocket.off("room_updated", handleRoomUpdated);
      gameWebSocket.off("settings_updated", handleSettingsUpdated);
      gameWebSocket.off("player_joined", handlePlayerJoined);
      gameWebSocket.off("game_started", handleGameStarted);
      gameWebSocket.off("drawing_submitted", handleDrawingSubmitted);
      gameWebSocket.off("chat_message", handleChatMessage);
      gameWebSocket.off("connection_lost", handleConnectionLost);
      gameWebSocket.off("error", handleError);
      clearInterval(heartbeatInterval);
      // Don't close WebSocket - it should stay open for the session
    };
  }, [toast, setLocation]);

  // Timer logic
  useEffect(() => {
    if (!room) return;

    const currentRound = room.rounds[room.currentRound - 1];
    if (!currentRound) return;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - currentRound.startTime;
      const limit = room.phase === "drawing" 
        ? room.settings.drawingTime * 1000 
        : room.settings.roundTime * 1000;
      const remaining = Math.max(0, Math.ceil((limit - elapsed) / 1000));
      setTimeRemaining(remaining);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    return () => clearInterval(timerInterval);
  }, [room]);

  const handleLeaveRoom = () => {
    gameWebSocket.leaveRoom();
    setLocation("/");
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card border-none">
          <CardContent className="p-8 text-center">
            <div className="text-white text-lg mb-4">Connecting to game...</div>
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlayer = room.players.find(p => p.id === gameWebSocket.playerId);
  const isHost = currentPlayer?.isHost || false;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <div className="glass-card rounded-xl p-4 md:p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-[#A29BFE] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </div>
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold text-white">
                Draw Deceiver <span className="text-accent">DX</span>
              </h1>
              <p className="text-xs md:text-sm text-white/60">Room: {room.code}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLeaveRoom}
            className="text-white/80 hover:text-white hover:bg-white/20"
            data-testid="button-leave-room"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Leave Room
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        {room.phase === "lobby" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card border-none">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                      <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
                        Game Lobby
                      </h2>
                      <p className="text-white/60">Waiting for players...</p>
                    </div>
                    <div className="text-center">
                      <div className="glass-card px-4 md:px-6 py-3 rounded-xl inline-block">
                        <div className="text-white/60 text-xs mb-1">Room Code</div>
                        <div 
                          className="font-heading text-2xl md:text-3xl font-bold text-primary tracking-wider"
                          data-testid="text-room-code"
                        >
                          {room.code}
                        </div>
                      </div>
                    </div>
                  </div>

                  <PlayerList players={room.players} currentPlayerId={gameWebSocket.playerId} />

                  <div className="flex items-center space-x-3 mt-6">
                    {isHost ? (
                      <Button
                        className="glass-button flex-1 py-3 rounded-xl font-heading font-semibold text-white"
                        onClick={() => gameWebSocket.startGame()}
                        disabled={room.players.length < 2 || !room.players.filter(p => !p.isHost).every(p => p.isReady)}
                        data-testid="button-start-game"
                      >
                        🎮 Start Game
                      </Button>
                    ) : (
                      <Button
                        className="glass-button flex-1 py-3 rounded-xl font-heading font-semibold text-white"
                        onClick={() => gameWebSocket.toggleReady()}
                        data-testid="button-toggle-ready"
                      >
                        {currentPlayer?.isReady ? "✓ Ready" : "Ready Up"}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="glass-card px-4 py-3 rounded-xl text-white/80 hover:bg-white/20"
                      data-testid="button-share"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Chat messages={chatMessages} onSendMessage={(msg) => gameWebSocket.sendChatMessage(msg)} />
            </div>

            <div className="space-y-6">
              <LobbySettings
                settings={room.settings}
                isHost={isHost}
                onUpdateSettings={(settings) => gameWebSocket.updateSettings(settings)}
              />
            </div>
          </div>
        )}

        {room.phase === "drawing" && (
          <DrawingCanvas
            room={room}
            currentPlayer={currentPlayer!}
            timeRemaining={timeRemaining}
            onSubmitDrawing={(snapshot) => gameWebSocket.submitDrawing(snapshot)}
            onDrawStroke={(stroke) => gameWebSocket.drawStroke(stroke)}
          />
        )}

        {room.phase === "guessing" && (
          <GuessingPhase
            room={room}
            currentPlayer={currentPlayer!}
            timeRemaining={timeRemaining}
            onVoteTarget={(playerId) => gameWebSocket.voteTarget(playerId)}
            onSubmitGuess={(guess) => gameWebSocket.submitGuess(guess)}
          />
        )}

        {(room.phase === "results" || room.phase === "round_end") && (
          <Results
            room={room}
            onPlayAgain={() => {
              // Host would create new game
              if (isHost) {
                gameWebSocket.leaveRoom();
                setLocation("/");
              }
            }}
            onBackToLobby={() => {
              gameWebSocket.leaveRoom();
              setLocation("/");
            }}
          />
        )}
      </main>
    </div>
  );
}
