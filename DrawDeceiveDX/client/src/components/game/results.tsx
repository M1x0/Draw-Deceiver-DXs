import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameRoom } from "@shared/schema";
import { Confetti } from "@/components/ui/confetti";
import { cn } from "@/lib/utils";

interface ResultsProps {
  room: GameRoom;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export default function Results({ room, onPlayAgain, onBackToLobby }: ResultsProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (room.phase === "results") {
      setShowConfetti(true);
      const timeout = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [room.phase]);

  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const podium = sortedPlayers.slice(0, 3);

  const currentRound = room.rounds[room.currentRound - 1];
  const totalGuesses = currentRound?.results ? 
    Object.keys(currentRound.results.pointsAwarded).length : 0;
  const correctGuesses = currentRound?.results?.correctGuesses || 0;
  const accuracyRate = totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <Confetti active={showConfetti} />

      {/* Victory Banner */}
      <Card className="glass-card border-none mb-8 text-center relative overflow-hidden">
        <CardContent className="p-8 relative z-10">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
            {room.phase === "results" ? "Game Complete!" : "Round Complete!"}
          </h2>
          <p className="text-white/80 text-lg">
            Round {room.currentRound} of {room.settings.rounds}
            {room.phase === "results" && " - Final Results"}
          </p>
        </CardContent>
      </Card>

      {room.phase === "results" && (
        <>
          {/* Podium */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* 2nd Place */}
            {podium[1] && (
              <div className="md:order-1 md:mt-12">
                <Card className="glass-card border-none">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">🥈</div>
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold avatar-ring"
                      style={{
                        background: `linear-gradient(135deg, ${podium[1].avatarColor}, ${podium[1].avatarColor}cc)`
                      }}
                    >
                      {podium[1].avatarInitials}
                    </div>
                    <h3 className="font-heading text-xl font-bold text-white mb-1">
                      {podium[1].username}
                    </h3>
                    <div className="text-secondary text-3xl font-heading font-bold">
                      {podium[1].score}
                    </div>
                    <div className="text-white/60 text-sm">points</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 1st Place */}
            {podium[0] && (
              <div className="md:order-2">
                <Card className="glass-card border-none border-4 border-accent">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">👑</div>
                    <div
                      className="w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-3xl font-bold avatar-ring"
                      style={{
                        background: `linear-gradient(135deg, ${podium[0].avatarColor}, ${podium[0].avatarColor}cc)`
                      }}
                    >
                      {podium[0].avatarInitials}
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-white mb-1">
                      {podium[0].username}
                    </h3>
                    <div className="text-accent text-4xl font-heading font-bold">
                      {podium[0].score}
                    </div>
                    <div className="text-white/60 text-sm mb-4">points</div>
                    <span className="px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-bold">
                      WINNER
                    </span>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 3rd Place */}
            {podium[2] && (
              <div className="md:order-3 md:mt-12">
                <Card className="glass-card border-none">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">🥉</div>
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold avatar-ring"
                      style={{
                        background: `linear-gradient(135deg, ${podium[2].avatarColor}, ${podium[2].avatarColor}cc)`
                      }}
                    >
                      {podium[2].avatarInitials}
                    </div>
                    <h3 className="font-heading text-xl font-bold text-white mb-1">
                      {podium[2].username}
                    </h3>
                    <div className="text-accent text-3xl font-heading font-bold">
                      {podium[2].score}
                    </div>
                    <div className="text-white/60 text-sm">points</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </>
      )}

      {/* Full Leaderboard */}
      <Card className="glass-card border-none mb-8">
        <CardContent className="p-8">
          <h3 className="font-heading text-2xl font-bold text-white mb-6">
            {room.phase === "results" ? "Final Leaderboard" : "Current Standings"}
          </h3>
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <Card
                key={player.id}
                className={cn(
                  "glass-card border-none",
                  index === 0 && room.phase === "results" && "border-2 border-accent"
                )}
                data-testid={`leaderboard-player-${player.id}`}
              >
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className="text-2xl font-heading font-bold text-white/40 w-8">
                    {index + 1}
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${player.avatarColor}, ${player.avatarColor}cc)`
                    }}
                  >
                    {player.avatarInitials}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{player.username}</div>
                    <div className="text-white/60 text-sm">
                      Role: {player.role === "target" ? "🎯 Target" : "🎭 Deceiver"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "text-2xl font-heading font-bold",
                        index === 0 && room.phase === "results" ? "text-accent" : "text-white"
                      )}
                    >
                      {player.score}
                    </div>
                    <div className="text-white/60 text-xs">points</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Statistics */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card border-none">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-heading font-bold text-primary mb-1">
              {accuracyRate}%
            </div>
            <div className="text-white/60 text-sm">Accuracy Rate</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-none">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-3xl font-heading font-bold text-secondary mb-1">
              {room.settings.drawingTime}s
            </div>
            <div className="text-white/60 text-sm">Drawing Time Limit</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-none">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-2">🎭</div>
            <div className="text-3xl font-heading font-bold text-accent mb-1">
              {currentRound?.results?.deceiverSuccesses || 0}
            </div>
            <div className="text-white/60 text-sm">Successful Deceptions</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 flex-wrap gap-4">
        {room.phase === "results" && (
          <>
            <Button
              className="glass-button px-8 py-4 rounded-xl font-heading font-bold text-lg text-white"
              onClick={onPlayAgain}
              data-testid="button-play-again"
            >
              🔄 Play Again
            </Button>
            <Button
              className="glass-button-secondary px-8 py-4 rounded-xl font-heading font-bold text-lg text-white"
              onClick={onBackToLobby}
              data-testid="button-back-to-lobby"
            >
              🏠 Back to Home
            </Button>
          </>
        )}
        {room.phase === "round_end" && (
          <Card className="glass-card border-none w-full">
            <CardContent className="p-6 text-center">
              <div className="text-white/80 text-lg mb-2">Next round starting soon...</div>
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
