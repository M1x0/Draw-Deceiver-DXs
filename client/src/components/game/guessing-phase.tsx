import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameRoom, Player } from "@shared/schema";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn } from "@/lib/utils";

interface GuessingPhaseProps {
  room: GameRoom;
  currentPlayer: Player;
  timeRemaining: number;
  onVoteTarget: (playerId: string) => void;
  onSubmitGuess: (guess: string) => void;
}

export default function GuessingPhase({
  room,
  currentPlayer,
  timeRemaining,
  onVoteTarget,
  onSubmitGuess
}: GuessingPhaseProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [guessInput, setGuessInput] = useState("");

  const currentRound = room.rounds[room.currentRound - 1];
  const timeProgress = currentRound ? (timeRemaining / room.settings.roundTime) * 100 : 0;
  const gameMode = room.settings.gameMode;
  const modeData = currentRound?.modeData;

  // Sudden death - check if player is eliminated
  const isEliminated = gameMode === "sudden_death" && 
    modeData?.eliminatedPlayers?.includes(currentPlayer.id);

  const handleVote = (playerId: string) => {
    setSelectedPlayer(playerId);
    onVoteTarget(playerId);
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guessInput.trim()) {
      onSubmitGuess(guessInput.trim());
      setGuessInput("");
    }
  };

  const votedCount = currentRound ? Object.keys(currentRound.votes).length : 0;
  const totalPlayers = room.players.length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Phase Header */}
      <Card className="glass-card border-none mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Guessing Phase</h2>
              <p className="text-white/60">Analyze the drawings and guess who drew the target word!</p>
            </div>
            <ProgressRing progress={timeProgress} size={96} color="#FDCB6E">
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-white" data-testid="time-remaining">
                  {timeRemaining}
                </div>
                <div className="text-xs text-white/60">seconds</div>
              </div>
            </ProgressRing>
          </div>
        </CardContent>
      </Card>

      {/* Sudden Death Elimination Notice */}
      {isEliminated && (
        <Card className="glass-card border-none mb-6 bg-red-500/20">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-heading font-bold text-red-400 mb-2">
              💀 You've Been Eliminated!
            </div>
            <p className="text-white/80">
              You guessed incorrectly and are out for this round. Better luck next time!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Whisper Hints */}
      {gameMode === "whisper_hints" && modeData?.hints && modeData.hints.length > 0 && (
        <Card className="glass-card border-none mb-6">
          <CardContent className="p-6">
            <div className="text-white/60 text-sm mb-3">Cryptic Hints:</div>
            <div className="space-y-2">
              {modeData.hints.map((hint, i) => (
                <div key={i} className="text-white text-lg font-medium">
                  💡 {hint}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Target Word Display */}
      <Card className="glass-card border-none mb-6 text-center">
        <CardContent className="p-8">
          <div className="text-white/60 text-sm mb-3">The target word was:</div>
          <div className="text-4xl md:text-5xl font-heading font-bold text-primary mb-2" data-testid="target-word">
            {currentRound?.targetWord}
          </div>
          <div className="text-white/60 text-sm">Category: {currentRound?.category} </div>
        </CardContent>
      </Card>

      {/* Drawing Gallery */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {room.players.map((player) => {
          const snapshot = currentRound?.canvasSnapshots[player.id];
          const isSelected = selectedPlayer === player.id;
          const hasVoted = currentPlayer.hasGuessed;

          return (
            <Card
              key={player.id}
              className={cn(
                "glass-card border-none cursor-pointer transition-all hover:scale-105",
                isSelected && "border-2 border-accent",
                hasVoted && !isSelected && "opacity-50"
              )}
              onClick={() => !hasVoted && handleVote(player.id)}
              data-testid={`drawing-card-${player.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${player.avatarColor}, ${player.avatarColor}cc)`
                      }}
                    >
                      {player.avatarInitials}
                    </div>
                    <span className="text-white font-medium text-sm">{player.username}</span>
                  </div>
                  {isSelected && <span className="text-accent text-xs font-bold">SELECTED</span>}
                </div>
                {snapshot ? (
                  <img
                    src={snapshot}
                    alt={`${player.username}'s drawing`}
                    className="w-full aspect-square rounded-lg bg-white object-contain"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-lg bg-white flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No drawing</span>
                  </div>
                )}
                <Button
                  className={cn(
                    "w-full mt-3 py-2 rounded-lg text-sm font-semibold",
                    isSelected ? "glass-button-secondary text-white" : "glass-button text-white"
                  )}
                  disabled={hasVoted}
                  data-testid={`button-vote-${player.id}`}
                >
                  {isSelected ? "✓ Voted" : "Vote Target"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alternative: Text Input Guess */}
      <Card className="glass-card border-none mb-6">
        <CardContent className="p-6">
          <h3 className="font-heading text-lg font-semibold text-white mb-4">
            Alternative: Type Your Guess
          </h3>
          <form onSubmit={handleGuessSubmit} className="flex space-x-3">
            <Input
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder="Type the word you think matches..."
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/30"
              disabled={currentPlayer.hasGuessed}
              data-testid="input-guess"
            />
            <Button
              type="submit"
              className="glass-button px-8 py-3 rounded-xl font-semibold text-white"
              disabled={currentPlayer.hasGuessed || isEliminated}
              data-testid="button-submit-guess"
            >
              {isEliminated ? "Eliminated" : "Submit Guess"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Voting Status */}
      <Card className="glass-card border-none">
        <CardContent className="p-6">
          <h3 className="font-heading text-lg font-semibold text-white mb-4">Voting Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-[#A29BFE] h-full rounded-full transition-all"
                  style={{ width: `${(votedCount / totalPlayers) * 100}%` }}
                />
              </div>
              <span className="text-white font-semibold text-sm">
                {votedCount}/{totalPlayers} voted
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
