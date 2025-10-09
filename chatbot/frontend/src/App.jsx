import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { PlusCircle, Trash2, Send } from "lucide-react";

export default function App() {
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 🧩 Load saved chats
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("chats")) || [];
    setChats(saved);
  }, []);

  // 💾 Save chats
  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  // ➕ Create new chat
  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
    };
    setChats([...chats, newChat]);
    setSelectedChat(newChat);
  };

  // ❌ Delete chat
  const deleteChat = (id) => {
    const updated = chats.filter((chat) => chat.id !== id);
    setChats(updated);
    if (selectedChat?.id === id) setSelectedChat(null);
  };

  // 📤 Send message
  const sendMessage = async () => {
    if (!input.trim() || !selectedChat) return;
    const newMsg = { sender: "user", text: input };
    const updated = chats.map((c) =>
      c.id === selectedChat.id
        ? { ...c, messages: [...c.messages, newMsg] }
        : c
    );
    setChats(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/chat/", {
        message: input,
      });
      const botMsg = {
        sender: "bot",
        text:
          res.data.reply ||
          (res.data.error ? `Error: ${res.data.error}` : "⚠️ No response"),
      };

      const final = updated.map((c) =>
        c.id === selectedChat.id
          ? { ...c, messages: [...c.messages, botMsg] }
          : c
      );
      setChats(final);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 👇 Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat]);

  return (
    <div className="h-screen flex bg-gray-950 text-gray-100 overflow-hidden">
      {/* 🧭 Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Chats</h2>
          <button
            onClick={createNewChat}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-sm"
          >
            <PlusCircle size={16} /> New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {chats.length === 0 && (
            <p className="text-gray-500 text-sm text-center mt-4">
              No chats yet
            </p>
          )}
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
                selectedChat?.id === chat.id
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <span className="truncate w-36">{chat.title}</span>
              <Trash2
                size={16}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
              />
            </div>
          ))}
        </div>
      </aside>

      {/* 💬 Main Chat */}
      <main className="flex-1 flex flex-col">
        <header className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900">
          <h1 className="text-xl font-semibold">AI Chatbot</h1>
          {selectedChat && (
            <button
              onClick={() => deleteChat(selectedChat.id)}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-950">
          {selectedChat ? (
            selectedChat.messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-lg max-w-xl ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                {msg.text}
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-10">
              Select or create a chat to start messaging 💬
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {selectedChat && (
          <div className="border-t border-gray-800 p-4 flex items-center gap-2 bg-gray-900">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-2 focus:outline-none focus:border-blue-500 text-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition"
            >
              {loading ? "..." : <Send size={16} />}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
