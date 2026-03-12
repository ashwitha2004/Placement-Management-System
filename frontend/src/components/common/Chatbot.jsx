import React, { useState, useRef, useEffect } from "react";
import { Send, X, MessageCircle, Minimize2, Maximize2, Bot, User, Loader2 } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

export default function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [provider, setProvider] = useState("connecting...");
  const messagesEndRef = useRef(null);

  // Generate unique key for storing chat history per user role
  const getChatHistoryKey = () => {
    if (!user) return "guest_chat";
    return `chat_${user._id || user.id}_${user.role || 'guest'}`;
  };

  // Load chat history from localStorage on mount or when user changes
  useEffect(() => {
    const historyKey = getChatHistoryKey();
    const savedMessages = localStorage.getItem(historyKey);
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages.map(m => ({
          ...m,
          time: new Date(m.time)
        })));
      } catch (error) {
        console.error('Error loading chat history:', error);
        setMessages([
          { id: 1, text: "Hello! I am your Gemini-powered Placement Assistant. How can I help you today?", sender: "bot", time: new Date() }
        ]);
      }
    } else {
      setMessages([
        { id: 1, text: "Hello! I am your Gemini-powered Placement Assistant. How can I help you today?", sender: "bot", time: new Date() }
      ]);
    }
  }, [user?._id, user?.id, user?.role]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    const historyKey = getChatHistoryKey();
    const messagesToSave = messages.map(m => ({
      ...m,
      time: m.time instanceof Date ? m.time.toISOString() : m.time
    }));
    localStorage.setItem(historyKey, JSON.stringify(messagesToSave));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    const userMessage = {
      id: Date.now(),
      text: userText,
      sender: "user",
      time: new Date()
    };

    const pendingId = Date.now() + 1;
    const pendingMessage = {
      id: pendingId,
      text: "Thinking...",
      sender: "bot",
      time: new Date(),
      isPending: true
    };

    setMessages((prev) => [...prev, userMessage, pendingMessage]);
    setInput("");

    // Prepare history for Gemini (mapped to 'message' to match backend controller)
    const history = messages
      .filter((m) => !m.isPending)
      .slice(-10)
      .map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        message: m.text
      }));

    // Gemini requires the first history entry to be a user message.
    while (history.length && history[0].role !== "user") {
      history.shift();
    }

    try {
      setIsSending(true);
      // Calling your backend endpoint /api/ai/chat via the 'api' service
      const response = await api.post("/ai/chat", {
        message: userText,
        history
      });

      const reply = response?.data?.reply;
      const replyProvider = response?.data?.provider || "gemini";
      
      setProvider(replyProvider);

      setMessages((prev) =>
        prev.map((m) => 
          m.id === pendingId 
            ? { ...m, text: reply, isPending: false, time: new Date() } 
            : m
        )
      );
    } catch (error) {
      console.error("Chatbot Error:", error);
      const errorMessage = error.response?.data?.reply || "I'm having trouble connecting to my brain. Please check the backend .env and API key.";
      
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? { ...m, text: errorMessage, isPending: false, sender: "bot" }
            : m
        )
      );
      setProvider("error");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-full shadow-2xl hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:scale-110 flex items-center justify-center"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-all ${
      isMinimized ? 'h-16' : 'h-[550px]'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">Career Intelligence</h3>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full animate-pulse ${provider === 'gemini' ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">
                {user?.role ? `${user.role}` : "Guest"} • {provider === "gemini" ? "Gemini 1.5" : "System Error"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => {
              if (window.confirm('Clear this chat history?')) {
                const historyKey = getChatHistoryKey();
                localStorage.removeItem(historyKey);
                setMessages([
                  { id: 1, text: "Hello! I am your Gemini-powered Placement Assistant. How can I help you today?", sender: "bot", time: new Date() }
                ]);
              }
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition text-xs"
            title="Clear chat history"
          >
            ✕
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-lg transition">
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-col h-[calc(100%-64px)]">
          {/* Chat Window */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] ${
                    msg.sender === "user" 
                      ? "bg-gradient-to-br from-blue-600 to-indigo-700" 
                      : "bg-gradient-to-br from-slate-600 to-slate-700"
                  }`}>
                    {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none"
                  }`}>
                    {msg.isPending ? (
                      <div className="flex items-center gap-2 italic opacity-70">
                        <Loader2 size={14} className="animate-spin" />
                        Thinking...
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    )}
                    <span className={`text-[9px] mt-1 block opacity-50 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                      {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask (${user?.role || 'Guest'})...`}
                className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className={`absolute right-1.5 p-2 rounded-lg transition-all ${
                  isSending || !input.trim() 
                    ? "text-slate-400 dark:text-slate-600" 
                    : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                }`}
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-[9px] text-center text-slate-400 dark:text-slate-500 mt-2 uppercase font-bold tracking-widest">
              🔒 Separate chats per role
            </p>
          </form>
        </div>
      )}
    </div>
  );
}