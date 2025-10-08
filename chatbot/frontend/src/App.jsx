import { useState, useEffect, useRef } from "react";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([
    {
      text: "👋 Hi there! I'm your AI assistant. How can I help you today?",
      sender: "bot",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const chatEndRef = useRef(null);
  const [lastUserMessage, setLastUserMessage] = useState("");

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (regenerate = false) => {
    const messageToSend = regenerate ? lastUserMessage : input.trim();
    if (messageToSend === "") return;

    if (!regenerate) {
      const userMessage = {
        text: messageToSend,
        sender: "user",
        time: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setLastUserMessage(messageToSend);
      setInput("");
    }

    setIsTyping(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/chat/", {
        message: messageToSend,
      });

      setTimeout(() => {
        const botMessage = {
          text: response.data.reply,
          sender: "bot",
          time: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error("Error communicating with server:", error);
      setTimeout(() => {
        const errorMessage = {
          text: "⚠️ Sorry, I couldn’t connect to the server.",
          sender: "bot",
          time: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
      }, 800);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleClear = () => setMessages([]);

  return (
    <div
      className={`h-screen w-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div
        className={`w-full max-w-3xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center px-6 py-3 ${
            darkMode ? "bg-gray-700" : "bg-blue-600 text-white"
          }`}
        >
          <h1 className="text-lg font-semibold flex items-center gap-2">
            AI Chat Assistant
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className={`px-3 py-1.5 rounded-full text-sm cursor-pointer ${
                darkMode
                  ? "bg-gray-600 hover:bg-gray-500"
                  : "bg-blue-800 hover:bg-blue-900"
              }`}
            >
              Clear Chat
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer ${
                darkMode
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {darkMode ? "🌙" : "🌞"}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-md ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : darkMode
                    ? "bg-gray-700 text-gray-100 rounded-bl-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-[10px] opacity-70 block mt-1 text-right">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div
                className={`px-3 py-2 rounded-2xl rounded-bl-none text-sm shadow-sm ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <span className="animate-pulse"> Typing...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* Input */}
        <div
          className={`flex items-center p-4 border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className={`flex-1 p-3 rounded-xl outline-none border ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-gray-100 border-gray-300 focus:ring-2 focus:ring-blue-400"
            }`}
          />

          <button
            onClick={() => handleSend()}
            className={`ml-3 px-5 py-2 rounded-xl font-medium transition cursor-pointer ${
              darkMode
                ? "bg-blue-500 hover:bg-blue-400 text-white"
                : "bg-blue-600 hover:bg-blue-800 text-white"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
