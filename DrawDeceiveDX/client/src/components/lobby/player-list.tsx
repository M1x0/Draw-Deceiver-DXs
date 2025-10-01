import React from "react";
import { Player } from "@shared/schema";
import { cn } from "@/lib/utils";

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string | null;
}

export default function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {players.map((player, index) => (
        <div
          key={player.id}
          className={cn(
            "glass-card rounded-xl p-4 flex items-center space-x-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary/50 animate-fade-in",
            player.id === currentPlayerId && "border-2 border-primary ring-2 ring-primary/20"
          )}
          style={{ animationDelay: `${index * 0.1}s` }}
          data-testid={`player-card-${player.id}`}
        >
          <div className="relative">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold avatar-ring floating-avatar"
              style={{
                background: `linear-gradient(135deg, ${player.avatarColor}, ${player.avatarColor}cc)`,
                animationDelay: `${index * 0.2}s`
              }}
            >
              {player.avatarInitials}
            </div>
            <div
              className={cn(
                "absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-background",
                player.isConnected ? "bg-success" : "bg-white/40"
              )}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white" data-testid={`player-name-${player.id}`}>
                {player.username}
              </span>
              {player.isBot && (
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full font-semibold flex items-center space-x-1 animate-pulse">
                  <span>🤖</span>
                  <span>BOT</span>
                </span>
              )}
              {player.isHost && (
                <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full font-semibold">
                  HOST
                </span>
              )}
              {player.id === currentPlayerId && (
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-semibold">
                  YOU
                </span>
              )}
            </div>
            <div className="text-white/60 text-sm">
              {player.isReady || player.isHost ? "Ready" : "Waiting..."}
            </div>
          </div>
          {(player.isReady || player.isHost) && (
            <div className="text-white/40">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
      ))}
      {players.length < 12 && (
        <div className="glass-card rounded-xl p-4 flex items-center space-x-4 opacity-50 border-2 border-dashed border-white/20 hover:opacity-70 transition-opacity duration-300 animate-pulse">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="flex-1">
            <span className="text-white/40 font-medium">Waiting for player...</span>
          </div>
        </div>
      )}
    </div>
  );
}
