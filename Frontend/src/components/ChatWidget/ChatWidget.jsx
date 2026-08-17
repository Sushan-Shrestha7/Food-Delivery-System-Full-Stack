import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import "./ChatWidget.css";
import { StoreContext } from "../../content/storeContext";

const ChatWidget = () => {
  const { url } = useContext(StoreContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm here to help with any questions about Ugrachandi. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${url}/api/assistant/chat`, {
        message: input,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.data.reply },
      ]);
    } catch (err) {
      console.error("Chat error", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I'm having trouble right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <p>Ugrachandi Assistant</p>
            <button className="chat-close" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message ${msg.role === "user" ? "chat-message-user" : "chat-message-bot"}`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="chat-message chat-message-bot chat-typing">
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      <button
        className="chat-bubble-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
};

export default ChatWidget;
