import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Send, Image as ImageIcon } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "system";
  timestamp: Date;
  isTyping?: boolean;
}


const systemResponse = "Gracias por tu consulta. Actualmente estamos en proceso de conformar nuestro equipo de dermatólogos especializados. Por el momento, este sistema proporciona análisis preliminares mediante inteligencia artificial. Para cualquier inquietud urgente, te recomendamos consultar directamente con un dermatólogo certificado.";

export function ConsultasSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Siempre empezar con mensaje de bienvenida vacío - NO cargar mensajes guardados
    // Limpiar cualquier mensaje guardado al montar el componente
    localStorage.removeItem("chatMessages");

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: "¡Hola! 👋 Bienvenido al chat de consultas médicas. Aquí puedes hacerme preguntas sobre tu tratamiento, compartir observaciones o dudas. ¿En qué puedo ayudarte hoy?",
      sender: "system",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);

    // Limpiar mensajes al desmontar o cuando se cierra la página
    const handleBeforeUnload = () => {
      localStorage.removeItem("chatMessages");
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Limpiar al desmontar
      localStorage.removeItem("chatMessages");
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (inputText.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    // NO guardar en localStorage - las consultas no se conservan
    setInputText("");

    // Ajustar altura del textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Simular respuesta del sistema
    setIsTyping(true);
    setTimeout(() => {
      const systemMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: systemResponse,
        sender: "system",
        timestamp: new Date(),
      };

      const newMessages = [...updatedMessages, systemMessage];
      setMessages(newMessages);
      // NO guardar en localStorage - las consultas no se conservan
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto ajustar altura
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-background max-w-5xl mx-auto w-full">
      <Card className="flex flex-col h-full max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-140px)] shadow-xl border-border animate-in fade-in slide-in-from-bottom duration-500">
        {/* Header */}
        <CardHeader className="border-b border-border bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 backdrop-blur rounded-full flex items-center justify-center animate-in scale-in duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="flex-1">
              <CardTitle className="text-primary-foreground">Consultas Médicas</CardTitle>
              <p className="text-sm text-primary-foreground/80">Equipo de Dermatología</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-primary-foreground/80 hidden sm:inline">En línea</span>
            </div>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-background" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}>
          {messages.map((message, index) => {
            const showDate = index === 0 ||
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex justify-center my-4 animate-in fade-in duration-300">
                    <span className="bg-muted/80 backdrop-blur text-muted-foreground px-3 py-1 rounded-full text-xs border border-border">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                )}

                <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`} style={{ animationDelay: `${index * 50}ms` }}>
                  <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] ${message.sender === "user"
                      ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl rounded-tr-sm shadow-md"
                      : "bg-card border border-border text-foreground rounded-2xl rounded-tl-sm shadow-sm"
                    } px-4 py-2.5 transition-all hover:shadow-md`}>
                    <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                      {message.text}
                    </p>
                    <div className={`flex items-center gap-1 mt-1 ${message.sender === "user" ? "justify-end" : "justify-start"
                      }`}>
                      <span className={`text-xs ${message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender === "user" && (
                        <svg className="w-4 h-4 text-primary-foreground/70" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card border border-border text-foreground rounded-2xl rounded-tl-sm shadow-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="border-t border-border bg-card p-3 sm:p-4 rounded-b-lg flex-shrink-0">
          <div className="flex items-end gap-2">
            {/* Text Input */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleTextareaChange}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu consulta aquí..."
                className="resize-none min-h-[44px] max-h-[120px] rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                rows={1}
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={inputText.trim() === ""}
              size="icon"
              className="flex-shrink-0 h-11 w-11 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          {/* Info Text */}
          <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </p>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="mt-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in slide-in-from-bottom duration-500 delay-300 hidden md:block">
        <p className="flex items-start gap-2">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>
            Este chat es para registro de consultas. Estamos conformando nuestro equipo de dermatólogos.
            Las respuestas actuales son automáticas. Para atención médica urgente, acude directamente a un dermatólogo certificado o a urgencias.
          </span>
        </p>
      </div>
    </div>
  );
}
