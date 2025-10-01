import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoomSettings, GameMode, WordCategory, Language } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

const gameModes: { value: GameMode; label: string; icon: string; description: string }[] = [
  { 
    value: "classic_deceiver", 
    label: "Classic Deceiver", 
    icon: "🎭", 
    description: "The original game mode! One target drawer gets the real word while deceivers get a fake word. Everyone draws simultaneously. Can you blend in or spot the deceiver?" 
  },
  { 
    value: "double_deceiver", 
    label: "Double Deceiver", 
    icon: "👥", 
    description: "Double the deception! Two target drawers know the real word while others are deceivers. More confusion, more fun, harder to spot who's lying!" 
  },
  { 
    value: "tool_lockout", 
    label: "Tool Lockout", 
    icon: "🔒", 
    description: "Challenge mode! 1-2 random drawing tools are disabled for everyone. Adapt your drawing style and work with limited tools to create your masterpiece." 
  },
  { 
    value: "camouflage_palette", 
    label: "Camouflage Palette", 
    icon: "🎨", 
    description: "Color confusion! Only 3-4 similar colors available. Make every stroke count when you can't rely on vibrant color variety to express your drawing." 
  },
  { 
    value: "fog_of_war", 
    label: "Fog of War", 
    icon: "🌫️", 
    description: "Limited vision! You can only see a small 100px radius around your cursor. Plan your drawing carefully when you can't see the full picture." 
  },
  { 
    value: "stencil_zones", 
    label: "Stencil Zones", 
    icon: "📐", 
    description: "Draw inside the box! Only 3-4 specific zones on the canvas are drawable. Position your strokes strategically within the allowed areas." 
  },
  { 
    value: "mirror_mayhem", 
    label: "Mirror Mayhem", 
    icon: "🪞", 
    description: "Backwards drawing! Everything you draw is mirrored horizontally. Train your brain to think in reverse and adapt to the flipped perspective." 
  },
  { 
    value: "echo_brush", 
    label: "Echo Brush", 
    icon: "📻", 
    description: "Double vision! Every stroke you make is duplicated with a 500ms delay. Create interesting patterns or embrace the chaotic echo effect." 
  },
  { 
    value: "eraser_roulette", 
    label: "Eraser Roulette", 
    icon: "🎰", 
    description: "Eraser surprise! The eraser randomly activates (15% chance every 2 seconds). Your drawing tools might betray you at any moment!" 
  },
  { 
    value: "time_bomb", 
    label: "Time Bomb", 
    icon: "💣", 
    description: "Explosive chaos! The canvas randomly clears every 5-15 seconds. Draw fast, think faster, and prepare to start over at any moment!" 
  },
  { 
    value: "shadow_lines", 
    label: "Shadow Lines", 
    icon: "👻", 
    description: "Ghostly traces! See other players' previous strokes with 25% opacity. Learn from others' drawings and build upon the collective artwork." 
  },
  { 
    value: "relay_draw", 
    label: "Relay Draw", 
    icon: "🔄", 
    description: "Take turns! Players draw one at a time in sequence. Pass the drawing torch and build upon what others started. Teamwork makes the dream work!" 
  },
  { 
    value: "ping_pong_guess", 
    label: "Ping-Pong Guess", 
    icon: "🏓", 
    description: "Rapid alternation! Switch between drawing and guessing phases 4 times per round. Stay alert and adapt quickly to the changing roles!" 
  },
  { 
    value: "whisper_hints", 
    label: "Whisper Hints", 
    icon: "💬", 
    description: "Cryptic clues! Get 2-3 mysterious hints during the guessing phase. Use your detective skills to decode the clues and find the target word." 
  },
  { 
    value: "sudden_death", 
    label: "Sudden Death", 
    icon: "⚡", 
    description: "High stakes! One wrong guess and you're eliminated from the round. Choose carefully, trust your instincts, and survive to the end!" 
  }
];

const wordCategories: { value: WordCategory; label: string; icon: string }[] = [
  { value: "animals", label: "Animals", icon: "🐾" },
  { value: "objects", label: "Objects", icon: "📦" },
  { value: "food", label: "Food", icon: "🍔" },
  { value: "actions", label: "Actions", icon: "🏃" },
  { value: "places", label: "Places", icon: "🏔️" },
  { value: "abstract", label: "Abstract", icon: "💭" }
];

interface LobbySettingsProps {
  settings: RoomSettings;
  isHost: boolean;
  onUpdateSettings: (settings: RoomSettings) => void;
}

export default function LobbySettings({ settings, isHost, onUpdateSettings }: LobbySettingsProps) {
  const [localSettings, setLocalSettings] = React.useState(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleUpdate = (updates: Partial<RoomSettings>) => {
    const newSettings = { ...localSettings, ...updates };
    setLocalSettings(newSettings);
    if (isHost) {
      onUpdateSettings(newSettings);
    }
  };

  if (!isHost) {
    // Display-only view for non-hosts
    return (
      <Card className="glass-card border-none">
        <CardContent className="p-6">
          <h3 className="font-heading text-lg font-semibold text-white mb-4">Game Settings</h3>
          <div className="space-y-4">
            <div className="py-2 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Game Mode</span>
                <span className="text-white font-semibold text-sm">
                  {gameModes.find(m => m.value === settings.gameMode)?.icon} {gameModes.find(m => m.value === settings.gameMode)?.label}
                </span>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-2" data-testid="text-game-mode-description-readonly">
                <p className="text-white/70 text-xs leading-relaxed">
                  {gameModes.find(m => m.value === settings.gameMode)?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Max Players</span>
              <span className="text-white font-semibold text-sm">{settings.maxPlayers}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Rounds</span>
              <span className="text-white font-semibold text-sm">{settings.rounds}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Round Time</span>
              <span className="text-white font-semibold text-sm">{settings.roundTime}s</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Drawing Time</span>
              <span className="text-white font-semibold text-sm">{settings.drawingTime}s</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-white/60 text-sm">Language</span>
              <span className="text-white font-semibold text-sm capitalize">{settings.language}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-white/60 text-sm">Privacy</span>
              <span className="text-white font-semibold text-sm">
                {settings.isPublic ? "Public" : "Private"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full settings editor for host
  return (
    <div className="space-y-6">
      <Card className="glass-card border-none">
        <CardContent className="p-6">
          <h3 className="font-heading text-lg font-semibold text-white mb-4">Game Mode</h3>
          <Select
            value={localSettings.gameMode}
            onValueChange={(value) => handleUpdate({ gameMode: value as GameMode })}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 transition-colors" data-testid="select-game-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {gameModes.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.icon} {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg" data-testid="text-game-mode-description">
            <p className="text-white/80 text-sm leading-relaxed">
              {gameModes.find(m => m.value === localSettings.gameMode)?.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none">
        <CardContent className="p-6 space-y-6">
          <div>
            <Label className="text-white font-semibold mb-3 block">
              Max Players: <span className="text-primary">{localSettings.maxPlayers}</span>
            </Label>
            <Slider
              value={[localSettings.maxPlayers]}
              onValueChange={([value]) => handleUpdate({ maxPlayers: value })}
              min={4}
              max={12}
              step={1}
              className="w-full"
              data-testid="slider-max-players"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>4</span>
              <span>12</span>
            </div>
          </div>

          <div>
            <Label className="text-white font-semibold mb-3 block">
              Rounds: <span className="text-primary">{localSettings.rounds}</span>
            </Label>
            <Slider
              value={[localSettings.rounds]}
              onValueChange={([value]) => handleUpdate({ rounds: value })}
              min={3}
              max={10}
              step={1}
              className="w-full"
              data-testid="slider-rounds"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>3</span>
              <span>10</span>
            </div>
          </div>

          <div>
            <Label className="text-white font-semibold mb-3 block">
              Round Time: <span className="text-primary">{localSettings.roundTime}s</span>
            </Label>
            <Slider
              value={[localSettings.roundTime]}
              onValueChange={([value]) => handleUpdate({ roundTime: value })}
              min={30}
              max={180}
              step={10}
              className="w-full"
              data-testid="slider-round-time"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>30s</span>
              <span>180s</span>
            </div>
          </div>

          <div>
            <Label className="text-white font-semibold mb-3 block">
              Drawing Time: <span className="text-primary">{localSettings.drawingTime}s</span>
            </Label>
            <Slider
              value={[localSettings.drawingTime]}
              onValueChange={([value]) => handleUpdate({ drawingTime: value })}
              min={15}
              max={120}
              step={5}
              className="w-full"
              data-testid="slider-drawing-time"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>15s</span>
              <span>120s</span>
            </div>
          </div>

          <div>
            <Label className="text-white font-semibold mb-3 block">Language</Label>
            <Select
              value={localSettings.language}
              onValueChange={(value) => handleUpdate({ language: value as Language })}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white" data-testid="select-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="swedish">Swedish</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white font-semibold mb-3 block">Decoy Similarity</Label>
            <Select
              value={localSettings.decoySimilarity}
              onValueChange={(value) => handleUpdate({ decoySimilarity: value as "easy" | "medium" | "hard" })}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white" data-testid="select-decoy-similarity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy - Very different words</SelectItem>
                <SelectItem value="medium">Medium - Somewhat similar words</SelectItem>
                <SelectItem value="hard">Hard - Very similar words</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-white font-semibold">Privacy</Label>
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${localSettings.isPublic ? 'text-white/40' : 'text-white'}`}>Private</span>
              <label className="relative inline-block w-12 h-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.isPublic}
                  onChange={(e) => handleUpdate({ isPublic: e.target.checked })}
                  className="sr-only peer"
                  data-testid="toggle-privacy"
                />
                <div className="w-12 h-6 bg-white/20 peer-checked:bg-primary rounded-full peer transition-all"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
              </label>
              <span className={`text-sm ${localSettings.isPublic ? 'text-white' : 'text-white/40'}`}>Public</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-white font-semibold">AI Bots</Label>
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${localSettings.botsEnabled ? 'text-white/40' : 'text-white'}`}>Off</span>
              <label className="relative inline-block w-12 h-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.botsEnabled || false}
                  onChange={(e) => handleUpdate({ botsEnabled: e.target.checked, botCount: e.target.checked ? 2 : 0 })}
                  className="sr-only peer"
                  data-testid="toggle-bots"
                />
                <div className="w-12 h-6 bg-white/20 peer-checked:bg-primary rounded-full peer transition-all"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
              </label>
              <span className={`text-sm ${localSettings.botsEnabled ? 'text-white' : 'text-white/40'}`}>On</span>
            </div>
          </div>

          {localSettings.botsEnabled && (
            <div>
              <Label className="text-white font-semibold mb-3 block">
                Bot Count: <span className="text-primary">{localSettings.botCount || 0}</span>
              </Label>
              <Slider
                value={[localSettings.botCount || 0]}
                onValueChange={([value]) => handleUpdate({ botCount: value })}
                min={1}
                max={Math.min(8, localSettings.maxPlayers - 1)}
                step={1}
                className="w-full"
                data-testid="slider-bot-count"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>1</span>
                <span>{Math.min(8, localSettings.maxPlayers - 1)}</span>
              </div>
              <p className="text-white/60 text-xs mt-2">
                🤖 Test the game solo with AI bots that draw and guess automatically!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card border-none">
        <CardContent className="p-6">
          <h3 className="font-heading text-lg font-semibold text-white mb-4">Word Packs</h3>
          <div className="grid grid-cols-2 gap-3">
            {wordCategories.map((category) => (
              <label
                key={category.value}
                className="glass-card rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all"
                data-testid={`checkbox-category-${category.value}`}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={localSettings.wordPacks.includes(category.value)}
                    onCheckedChange={(checked) => {
                      const newPacks = checked
                        ? [...localSettings.wordPacks, category.value]
                        : localSettings.wordPacks.filter(p => p !== category.value);
                      handleUpdate({ wordPacks: newPacks });
                    }}
                  />
                  <div className="text-center flex-1">
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className="text-white text-sm font-medium">{category.label}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
