import React, { useState } from "react";
import './Chatbot.css';
import axios from "../services/api"; // Import axios instance

// Floating Chatbot component for user support and phishing education
const Chatbot = () => {
  // State for chat window visibility
  const [open, setOpen] = useState(false);
  // State for chat messages
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! How can I help you with email phishing today?' }
  ]);
  // State for user input
  const [input, setInput] = useState("");

  // Predefined quick replies for common questions
  const quickReplies = [
    "What is phishing?",
    "How do I spot a phishing email?",
    "How do I report a suspicious email?"
  ];

  // Handle sending a message (now async, calls backend)
  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { from: 'user', text }]);
    setInput("");
    try {
      // Call backend /chatbot endpoint for reply
      const res = await axios.post("/chatbot", { message: text });
      setMessages(msgs => [...msgs, { from: 'bot', text: res.data.reply }]);
    } catch (e) {
      setMessages(msgs => [...msgs, { from: 'bot', text: "Sorry, I couldn't reach the server." }]);
    }
  };

  // Handle quick reply click
  const handleQuickReply = (reply) => {
    sendMessage(reply);
  };

  // Handle input submit
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="chatbot-container">
      {/* Floating button to open/close chat */}
      <button className="chatbot-fab" onClick={() => setOpen(o => !o)} aria-label="Open chatbot">
        💬
      </button>
      {/* Chat window overlay */}
      {open && (
        <div className="chatbot-window" role="dialog" aria-modal="true">
          <div className="chatbot-header">
            <span>Phishing Help Chatbot</span>
            <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close chatbot">×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg-${msg.from}`}>{msg.text}</div>
            ))}
          </div>
          <div className="chatbot-quick-replies">
            {quickReplies.map((qr, i) => (
              <button key={i} onClick={() => handleQuickReply(qr)}>{qr}</button>
            ))}
          </div>
          <form className="chatbot-input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your question..."
              aria-label="Type your question"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 