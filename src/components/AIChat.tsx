import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Sparkles,
  Lightbulb,
  MapPin,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { aiChatAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  recommendations?: Array<{
    id: string;
    title: string;
    location: string;
    price: number;
    image?: string;
  }>;
}

const AIChat = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t("aiChat.welcome"),
      timestamp: new Date(),
      suggestions: [
        t("aiChat.suggestions.coffee"),
        t("aiChat.suggestions.popular"),
        t("aiChat.suggestions.budget"),
        t("aiChat.suggestions.culture")
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiChatAPI.sendMessage({
        message: userMessage.content,
        userId: user?.id,
        context: {
          isAuthenticated,
          userRole: user?.role,
          previousMessages: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.message || response.message || "I'm here to help!",
        timestamp: new Date(),
        suggestions: response.data.suggestions,
        recommendations: response.data.recommendations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("AI Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or feel free to browse our experiences directly.",
        timestamp: new Date(),
        suggestions: [
          "Browse all experiences",
          "Contact support",
          "Try asking again"
        ]
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleRecommendationClick = (recommendation: any) => {
    window.location.href = `/experiences/${recommendation.id}`;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
              aria-label="Open AI Chat"
            >
              <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-secondary rounded-full flex items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-secondary-foreground" />
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)]"
          >
            <Card className="h-full flex flex-col shadow-2xl border-2 border-primary/20">
              {/* Header */}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                      <AvatarFallback>
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-secondary rounded-full border-2 border-background flex items-center justify-center">
                      <Sparkles className="h-2.5 w-2.5 text-secondary-foreground" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI Assistant</h3>
                    <p className="text-xs text-muted-foreground">Always here to help</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "assistant" && (
                          <Avatar className="h-8 w-8 bg-primary/10 text-primary shrink-0">
                            <AvatarFallback>
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            "flex flex-col gap-1 max-w-[80%]",
                            message.role === "user" ? "items-end" : "items-start"
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-lg px-4 py-2.5 text-sm",
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            )}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground px-1">
                            {formatTime(message.timestamp)}
                          </span>

                          {/* Recommendations */}
                          {message.recommendations && message.recommendations.length > 0 && (
                            <div className="mt-2 space-y-2 w-full">
                              {message.recommendations.map((rec) => (
                                <Card
                                  key={rec.id}
                                  className="cursor-pointer hover:border-primary/50 transition-colors"
                                  onClick={() => handleRecommendationClick(rec)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex gap-3">
                                      {rec.image && (
                                        <img
                                          src={rec.image}
                                          alt={rec.title}
                                          className="w-16 h-16 rounded object-cover"
                                        />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm truncate">{rec.title}</h4>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                          <MapPin className="h-3 w-3" />
                                          <span className="truncate">{rec.location}</span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                          <Badge variant="secondary" className="text-xs">
                                            ${rec.price}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}

                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="text-xs h-auto py-1.5 px-3 whitespace-normal"
                                >
                                  <Lightbulb className="h-3 w-3 mr-1" />
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        {message.role === "user" && (
                          <Avatar className="h-8 w-8 bg-muted shrink-0">
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <Avatar className="h-8 w-8 bg-primary/10 text-primary shrink-0">
                          <AvatarFallback>
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg px-4 py-2.5">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Input */}
              <div className="p-4 border-t bg-muted/30">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("aiChat.inputPlaceholder")}
                    className="flex-1"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChat;
