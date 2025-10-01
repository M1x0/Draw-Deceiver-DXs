import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@shared/schema";

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export default function Chat({ messages, onSendMessage }: ChatProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarColor = (playerId: string) => {
    const colors = [
      "#6C5CE7", "#A29BFE", "#00CEC9", "#81ECEC", "#FDCB6E",
      "#FF7675", "#FD79A8", "#00B894", "#55EFC4", "#74B9FF"
    ];
    const hash = playerId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <Card className="glass-card border-none">
      <CardContent className="p-6">
        <h3 className="font-heading text-lg font-semibold text-white mb-4">Chat</h3>
        <div className="space-y-3 mb-4 h-48 overflow-y-auto" data-testid="chat-messages">
          {messages.length === 0 ? (
            <div className="text-center text-white/40 text-sm py-8">
              No messages yet. Say hello! 👋
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3" data-testid={`chat-message-${message.id}`}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${getAvatarColor(message.playerId)}, ${getAvatarColor(message.playerId)}cc)`
                  }}
                >
                  {getInitials(message.playerName)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-white text-sm">{message.playerName}</span>
                    <span className="text-white/40 text-xs">{formatTime(message.timestamp)}</span>
                  </div>
                  <div className="text-white/80 text-sm break-words">{message.message}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/30"
            maxLength={200}
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            className="glass-button px-4 py-2 rounded-xl text-white"
            data-testid="button-send-message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
