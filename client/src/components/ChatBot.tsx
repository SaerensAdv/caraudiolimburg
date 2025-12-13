import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Headphones, User, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function AudioBars() {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-[3px] bg-[#d0a760] rounded-full"
          animate={{
            height: ["40%", "100%", "60%", "80%", "40%"],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hallo! Ik ben de AI-assistent van Car Audio Limburg. Hoe kan ik je helpen met car audio, multimedia of installatie vragen?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.filter((m) => m.role !== "assistant" || messages.indexOf(m) !== 0),
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, er is iets misgegaan. Probeer het later opnieuw of neem contact met ons op.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(208,167,96,0.2)]"
            data-testid="chatbot-window"
          >
            <div className="bg-[#0a0a0a] border border-[#d0a760]/30">
              <div className="bg-gradient-to-r from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] p-4 flex items-center justify-between border-b border-[#d0a760]/20">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-[#d0a760] to-[#a88540] flex items-center justify-center shadow-[0_0_20px_rgba(208,167,96,0.3)]">
                    <Headphones className="w-5 h-5 text-[#0a0a0a]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white tracking-wide">Car Audio Assistent</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-xs text-[#d0a760]/80">Online</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-none"
                  data-testid="chatbot-close"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <ScrollArea className="h-[350px] p-4 bg-[#0a0a0a]">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-[#d0a760] to-[#a88540]"
                            : "bg-zinc-800 border border-[#d0a760]/20"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="w-4 h-4 text-[#0a0a0a]" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-[#d0a760]" />
                        )}
                      </div>
                      <div
                        className={`max-w-[75%] px-4 py-2.5 ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-[#d0a760] to-[#a88540] text-[#0a0a0a] font-medium"
                            : "bg-zinc-900 text-zinc-100 border border-zinc-800"
                        }`}
                        data-testid={`chat-message-${message.role}-${index}`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-zinc-800 border border-[#d0a760]/20 flex items-center justify-center">
                        <Volume2 className="w-4 h-4 text-[#d0a760]" />
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <AudioBars />
                          <span className="text-sm text-zinc-400">Aan het typen...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800/50 bg-[#0a0a0a]">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Stel een vraag..."
                    className="flex-1 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 rounded-none focus:border-[#d0a760]/50 focus:ring-[#d0a760]/20"
                    disabled={isLoading}
                    data-testid="chatbot-input"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-br from-[#d0a760] to-[#a88540] hover:from-[#e0b770] hover:to-[#b89550] text-[#0a0a0a] rounded-none shadow-[0_0_15px_rgba(208,167,96,0.2)] disabled:opacity-50"
                    data-testid="chatbot-send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#d0a760] to-[#a88540] shadow-[0_4px_20px_rgba(208,167,96,0.4)] flex items-center justify-center group"
        whileHover={{ scale: 1.05, boxShadow: "0 6px 30px rgba(208,167,96,0.5)" }}
        whileTap={{ scale: 0.95 }}
        data-testid="chatbot-toggle"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#d0a760] to-[#a88540] animate-subtle-pulse" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative z-10"
            >
              <X className="w-6 h-6 text-[#0a0a0a]" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative z-10"
            >
              <MessageCircle className="w-6 h-6 text-[#0a0a0a]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
