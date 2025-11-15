import { useState, useRef, useEffect } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant. I'm here to help with dyslexia and ADHD support. How can I assist you today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    
    // Add user message to chat
    const newUserMessage = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Prepare conversation history
      const conversationHistory = [...messages, newUserMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call backend API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
      const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: conversationHistory.slice(0, -1), // Exclude the current message
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      // Add assistant response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm your AI assistant. I'm here to help with dyslexia and ADHD support. How can I assist you today?",
      },
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            left: "20px",
            bottom: "100px",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
            border: "none",
            color: "#FFFFFF",
            fontSize: "28px",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3), 0 0 0 4px rgba(255, 255, 255, 0.1)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            animation: "pulse 2s infinite",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(59, 130, 246, 0.4), 0 0 0 6px rgba(255, 255, 255, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(59, 130, 246, 0.3), 0 0 0 4px rgba(255, 255, 255, 0.1)";
          }}
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatContainerRef}
          style={{
            position: "fixed",
            left: "20px",
            bottom: "20px",
            width: "380px",
            height: "600px",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            background: "#FFFFFF",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
            border: "2px solid #3B82F6",
            overflow: "hidden",
          }}
        >
          <style jsx>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#FFFFFF",
            }}
          >
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>
                AI Assistant
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>
                Dyslexia & ADHD Support
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={clearChat}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                }}
                title="Clear chat"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                  e.currentTarget.style.transform = "rotate(90deg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.transform = "rotate(0deg)";
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              background: "#F9FAFB",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: "16px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)"
                        : "#FFFFFF",
                    color: msg.role === "user" ? "#FFFFFF" : "#1F2937",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    wordWrap: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "16px",
                    background: "#FFFFFF",
                    fontSize: "14px",
                    color: "#6B7280",
                  }}
                >
                  <span style={{ animation: "pulse 1.5s infinite" }}>●</span>
                  <span style={{ animation: "pulse 1.5s infinite", animationDelay: "0.2s", marginLeft: "4px" }}>●</span>
                  <span style={{ animation: "pulse 1.5s infinite", animationDelay: "0.4s", marginLeft: "4px" }}>●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "16px",
              background: "#FFFFFF",
              borderTop: "1px solid rgba(0, 0, 0, 0.1)",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "12px",
                border: "2px solid rgba(0, 0, 0, 0.1)",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#3B82F6";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                border: "none",
                background:
                  isLoading || !inputMessage.trim()
                    ? "rgba(59, 130, 246, 0.3)"
                    : "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
                color: "#FFFFFF",
                fontSize: "16px",
                cursor: isLoading || !inputMessage.trim() ? "not-allowed" : "pointer",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isLoading && inputMessage.trim()) {
                  e.currentTarget.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

