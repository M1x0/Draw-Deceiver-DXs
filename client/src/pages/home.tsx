import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { gameWebSocket } from "@/lib/websocket";
import { GameMode, RoomSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username to create a room",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsConnecting(true);
      await gameWebSocket.connect();

      const settings: RoomSettings = {
        maxPlayers: 8,
        rounds: 5,
        roundTime: 90,
        drawingTime: 60,
        decoySimilarity: "medium",
        wordPacks: ["animals", "objects", "food"],
        language: "english",
        isPublic: true,
        gameMode: "classic_deceiver"
      };

      gameWebSocket.on("room_created", (data) => {
        setLocation("/game");
      });

      gameWebSocket.createRoom(username, settings);
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Could not connect to game server",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username to join a room",
        variant: "destructive"
      });
      return;
    }

    if (!roomCode.trim()) {
      toast({
        title: "Room code required",
        description: "Please enter a room code to join",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsConnecting(true);
      await gameWebSocket.connect();

      gameWebSocket.on("room_joined", (data) => {
        setLocation("/game");
      });

      gameWebSocket.on("error", (data) => {
        toast({
          title: "Failed to join room",
          description: data.message,
          variant: "destructive"
        });
        setIsConnecting(false);
      });

      gameWebSocket.joinRoom(roomCode.toUpperCase(), username);
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Could not connect to game server",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <div className="glass-card rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-[#A29BFE] rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
                Draw Deceiver <span className="text-accent">DX</span>
              </h1>
              <p className="text-sm text-white/60">Multiplayer Drawing Deception</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Welcome card */}
          <Card className="glass-card border-none">
            <CardContent className="p-8 flex flex-col justify-between min-h-[500px]">
              <div>
                <h2 className="font-heading text-4xl font-bold text-white mb-4">
                  Welcome to<br />Draw Deceiver DX
                </h2>
                <p className="text-white/80 text-lg mb-6">
                  The ultimate multiplayer drawing deception game. Draw, deceive, and deduce your way to victory!
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/30 rounded-lg flex items-center justify-center">
                      <span className="text-xl">👥</span>
                    </div>
                    <span className="text-white/90">4-12 players per room</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-secondary/30 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🎭</span>
                    </div>
                    <span className="text-white/90">15 unique game modes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/30 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🌍</span>
                    </div>
                    <span className="text-white/90">Swedish & English support</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  data-testid="input-username"
                />
                <Button
                  className="glass-button w-full py-6 rounded-xl font-heading font-bold text-lg text-white"
                  onClick={handleCreateRoom}
                  disabled={isConnecting}
                  data-testid="button-create-room"
                >
                  🎮 Create Room
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Join room card */}
          <Card className="glass-card border-none">
            <CardContent className="p-8">
              <h3 className="font-heading text-2xl font-bold text-white mb-6">Join with Code</h3>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Username</label>
                  <Input
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    data-testid="input-username-join"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Room Code</label>
                  <Input
                    placeholder="Enter 6-digit code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="bg-white/10 border-white/20 text-white text-center text-2xl font-bold tracking-widest placeholder:text-white/30"
                    data-testid="input-room-code"
                  />
                </div>
                <Button
                  className="glass-button w-full py-3 rounded-xl font-heading font-semibold text-white"
                  onClick={handleJoinRoom}
                  disabled={isConnecting}
                  data-testid="button-join-room"
                >
                  Join Game
                </Button>
              </div>

              <div className="pt-8 border-t border-white/10">
                <h4 className="font-heading text-lg font-semibold text-white mb-4">Game Modes Preview</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">🎭</div>
                    <div className="text-xs font-medium text-white">Classic Deceiver</div>
                  </div>
                  <div className="glass-card rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">🔄</div>
                    <div className="text-xs font-medium text-white">Relay Draw</div>
                  </div>
                  <div className="glass-card rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">🌫️</div>
                    <div className="text-xs font-medium text-white">Fog of War</div>
                  </div>
                  <div className="glass-card rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">👥</div>
                    <div className="text-xs font-medium text-white">Double Deceiver</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats section */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <Card className="glass-card border-none">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-heading font-bold text-primary mb-2">100+</div>
              <div className="text-white/60 text-sm">Word Pairs</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-none">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-heading font-bold text-secondary mb-2">15</div>
              <div className="text-white/60 text-sm">Game Modes</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-none">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-heading font-bold text-accent mb-2">2</div>
              <div className="text-white/60 text-sm">Languages</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-none">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-heading font-bold text-success mb-2">12</div>
              <div className="text-white/60 text-sm">Max Players</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
