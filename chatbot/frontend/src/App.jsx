import { useState } from "react";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm chatbot. How can I help you?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); // 👈 NEW

  const handleSend = async () => {
    if (input.trim() === "") return;

    const newUserMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsTyping(true); // 👈 show typing animation

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/chat/", {
        message: input,
      });
      console.log(response.data);

      setTimeout(() => {
        setIsTyping(false); // 👈 hide typing animation
        const botMessage = { text: response.data.reply, sender: "bot" };
        setMessages((prev) => [...prev, botMessage]);
      }, 500);
    } catch (e) {
      console.error("Error communicating with the server:", e);
      setTimeout(() => {
        setIsTyping(false);
        const errorMessage = {
          text: "⚠️ Sorry, I couldn’t connect to the server.",
          sender: "bot",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md h-[600px] bg-white shadow-xl rounded-2xl flex flex-col overflow-hidden">
        <div className="bg-blue-600 text-white text-center py-3 text-lg font-semibold">
          Simple Chatbot
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          ))}

          {/* 👇 Typing animation */}
          {isTyping && (
            <div className="bg-gray-200 text-gray-800 p-3 rounded-2xl inline-block animate-pulse">
              <span className="dot-flash">Typing...</span>
            </div>
          )}
        </div>

        <div className="flex items-center p-3 border-t">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 p-3 px-2.5 rounded-xl outline-none"
          />
          <button
            onClick={handleSend}
            className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-blue-800 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
