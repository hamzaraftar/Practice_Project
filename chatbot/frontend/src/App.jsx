import { useState, useEffect, useRef } from "react";
import axios from "axios";

function App() {
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem("chat_sessions_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load chats from localStorage:", e);
    }
    return [
      {
        id: "main",
        title: "Main Chat",
        messages: [
          {
            sender: "bot",
            text: "👋 Hi! I'm your chatbot. How can I help you today?",
            time: new Date().toLocaleTimeString(),
          },
        ],
      },
    ];
  });

  const [selectedId, setSelectedId] = useState(chats[0]?.id || "main");
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("chat_sessions_v1", JSON.stringify(chats));
    } catch (e) {
      console.error("Failed to save chats to localStorage:", e);
    }
  }, [chats]);

  const selectedChat = chats.find((c) => c.id === selectedId) || chats[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages?.length, isTyping]);

  const createNewChat = () => {
    const id = Date.now().toString();
    const newChat = {
      id,
      title: "New Chat", // default, will update on first user input
      messages: [
        {
          sender: "bot",
          text: "🆕 New chat started. Ask me anything!",
          time: new Date().toLocaleTimeString(),
        },
      ],
    };
    setChats((prev) => [...prev, newChat]);
    setSelectedId(id);
  };

  const deleteChat = (id) => {
    const updated = chats.filter((c) => c.id !== id);
    setChats(updated);
    if (selectedId === id) setSelectedId(updated[0]?.id ?? null);
  };

  const extractReplyText = (res) => {
    if (!res) return "";
    const data = res.data ?? res;
    if (typeof data === "string") return data;
    if (typeof data === "object") {
      if (data.reply) return data.reply;
      if (data.response) return data.response;
      if (data.result) return data.result;
      if (Array.isArray(data.choices) && data.choices[0]) {
        const m = data.choices[0].message ?? data.choices[0].text;
        return typeof m === "string" ? m : m?.content ?? "";
      }
      try {
        return JSON.stringify(data);
      } catch {
        return String(data);
      }
    }
    return String(data);
  };

  const typeBotText = (chatId, fullText, speed = 18) => {
    let i = 0;
    setIsTyping(true);

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  sender: "bot",
                  text: "",
                  time: new Date().toLocaleTimeString(),
                },
              ],
            }
          : c
      )
    );

    const interval = setInterval(() => {
      i++;
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          const msgs = [...c.messages];
          const lastIdx = msgs.length - 1;
          msgs[lastIdx] = { ...msgs[lastIdx], text: fullText.slice(0, i) };
          return { ...c, messages: msgs };
        })
      );

      if (i >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selectedChat) return;

    // 🧠 Update title with first user message if it's still the default one
    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id && (c.title === "New Chat" || c.title === "Main Chat")
          ? { ...c, title: text.length > 20 ? text.slice(0, 20) + "..." : text }
          : c
      )
    );

    const userMsg = {
      sender: "user",
      text,
      time: new Date().toLocaleTimeString(),
    };
    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id
          ? { ...c, messages: [...c.messages, userMsg] }
          : c
      )
    );
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/chat/", {
        message: text,
      });
      const replyText = extractReplyText(response);
      typeBotText(selectedChat.id, String(replyText));
    } catch (err) {
      console.error(err);
      const errText = "⚠️ Sorry — couldn't connect to the server.";
      setChats((prev) =>
        prev.map((c) =>
          c.id === selectedChat.id
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    sender: "bot",
                    text: errText,
                    time: new Date().toLocaleTimeString(),
                  },
                ],
              }
            : c
        )
      );
      setIsTyping(false);
    }
  };

  const clearSelectedChat = () => {
    if (!selectedChat) return;
    setChats((prev) =>
      prev.map((c) => (c.id === selectedChat.id ? { ...c, messages: [] } : c))
    );
  };

  return (
    <div className="h-screen w-screen flex bg-[#343541] text-gray-100">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "w-72" : "w-16"
        } bg-[#202123] text-white flex flex-col border-r border-gray-700`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className={`font-semibold text-lg ${!sidebarOpen && "hidden"}`}>
            💬 Chats
          </h2>
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="bg-gray-700 hover:bg-gray-600 p-2 rounded transition cursor-pointer"
          >
            {sidebarOpen ? "❌" : "☰"}
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-auto p-2">
          {chats.map((c, index) => (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`p-3 rounded-lg mb-2 cursor-pointer transition flex items-center justify-between ${
                c.id === selectedId
                  ? " bg-gray-700 hover:bg-gray-600"
                  : "hover:bg-gray-700/40"
              }`}
            >
              {sidebarOpen ? (
                <>
                  <span className="truncate text-sm font-medium">
                    {c.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(c.id);
                    }}
                    className="text-xs bg-red-600 px-2 py-0.5 rounded hover:bg-red-700 cursor-pointer"
                  >
                    ✖
                  </button>
                </>
              ) : (
                <div
                  title={c.title}
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold ${
                    c.id === selectedId
                      ? "bg-gray-800 text-white"
                      : "bg-gray-700"
                  }`}
                >
                  {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-700">
          {sidebarOpen && (
            <div className="flex flex-col gap-2">
              <button
                onClick={createNewChat}
                className="bg-gray-700 py-2 rounded font-semibold hover:bg-gray-600 cursor-pointer"
              >
                + New Chat
              </button>
              <button
                onClick={clearSelectedChat}
                className="bg-gray-700 py-2 rounded hover:bg-gray-600 cursor-pointer"
              >
                Clear Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 bg-[#202123] text-white flex justify-between items-center shadow">
          <h1 className="font-bold text-lg">AI Chat Bot</h1>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-[#343541]">
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {selectedChat?.messages?.length ? (
              selectedChat.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl max-w-[75%] shadow transition ${
                    m.sender === "user"
                      ? "self-end bg-gray-500 text-white"
                      : "self-start bg-[#40414f] text-gray-100"
                  }`}
                >
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                  <div className="text-[10px] opacity-70 mt-1 text-right">
                    {m.time}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 p-8 bg-[#40414f] rounded shadow">
                No messages yet — start conversing!
              </div>
            )}
            {isTyping && (
              <div className="self-start bg-[#40414f] p-3 rounded-2xl max-w-[40%] shadow">
                <div className="flex gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 bg-[#202123] border-t border-gray-700">
          <div className="max-w-3xl mx-auto flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-[#40414f] border border-gray-600 rounded-full px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
            />
            <button
              onClick={handleSend}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-full shadow cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
