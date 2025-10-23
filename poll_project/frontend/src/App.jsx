import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loadingVote, setLoadingVote] = useState(null);
  const [socket, setSocket] = useState(null);

  // 💬 Chat State
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Fetch polls
  const fetchPolls = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/polls/");
      setPolls(res.data);
    } catch (err) {
      console.error("Error fetching polls:", err);
    }
  };

  // Connect to WebSocket
  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/polls/");

    socket.onopen = () => console.log("✅ WebSocket connected");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 Update from server:", data);

      // 🗳 Handle poll or vote updates
      if (data.message === "vote_update" || data.message === "poll_update") {
        fetchPolls();
      }

      // 💬 Handle incoming chat messages
      if (data.type === "chat_message") {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.onerror = (e) => console.warn("⚠️ WebSocket error:", e);
    socket.onclose = () => console.error("❌ WebSocket disconnected");

    setSocket(socket);

    return () => socket.close();
  }, []);

  // Create poll
  const createPoll = async (e) => {
    e.preventDefault();
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      alert("Please fill in the question and all options.");
      return;
    }
    try {
      await axios.post("http://localhost:8000/api/polls/", {
        question,
        options,
      });
      setQuestion("");
      setOptions(["", ""]);
      fetchPolls();
      socket?.send(JSON.stringify({ type: "poll_update" }));
    } catch (err) {
      console.error("Error creating poll:", err);
    }
  };

  // Vote
  const vote = async (optionId) => {
    setLoadingVote(optionId);
    try {
      await axios.post("http://localhost:8000/api/vote/", { option: optionId });
      fetchPolls();
      socket?.send(JSON.stringify({ type: "vote_update" }));
    } catch (err) {
      console.error("Error voting:", err);
    } finally {
      setLoadingVote(null);
    }
  };

  // Delete poll
  const deletePoll = async (pollId) => {
    try {
      await axios.delete(`http://localhost:8000/api/polls/${pollId}/delete/`);
      fetchPolls();
      socket?.send(JSON.stringify({ type: "poll_update" }));
    } catch (err) {
      console.error("Error deleting poll:", err);
    }
  };

  // Add new option field
  const addOption = () => setOptions([...options, ""]);
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // 💬 Send chat message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = { type: "chat_message", text: chatInput };
    socket?.send(JSON.stringify(msg));
    setChatInput("");
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Live Polls + Chat
      </h1>

      {/* Create Poll Form */}
      <form
        onSubmit={createPoll}
        className="max-w-xl w-full bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Create New Poll
        </h2>

        <input
          type="text"
          placeholder="Enter your poll question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {options.map((opt, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={opt}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            className="w-full p-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}

        <button
          type="button"
          onClick={addOption}
          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 mb-4 active:scale-95 rounded-lg transition transform duration-150"
        >
          + Add Option
        </button>

        <button
          type="submit"
          className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-2 font-semibold active:scale-95 rounded-lg transition transform duration-150"
        >
          Create Poll
        </button>
      </form>

      {/* Polls List */}
      <div className="space-y-4 max-w-2xl w-full mb-10">
        {polls.map((poll) => (
          <div
            key={poll.id}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
          >
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              {poll.question}
            </h3>
            <div className="space-y-2">
              {poll.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => vote(opt.id)}
                  disabled={loadingVote === opt.id}
                  className={`w-full text-left px-4 py-2 rounded-lg flex justify-between items-center transition duration-150 ${
                    loadingVote === opt.id
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                  }`}
                >
                  {opt.text}
                  <span className="font-bold">{opt.votes_count}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => deletePoll(poll.id)}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-lg transition transform duration-150 shadow-md cursor-pointer"
            >
              Delete Poll
            </button>
          </div>
        ))}
      </div>

      {/* 💬 Chat Section */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Live Chat</h2>
        <div className="flex-1 overflow-y-auto h-64 border p-2 rounded-lg bg-gray-50 mb-3">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center mt-20">
              No messages yet. Start chatting!
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className="bg-blue-100 px-3 py-2 rounded-lg mb-2 text-gray-800 shadow-sm"
              >
                {msg.text}
              </div>
            ))
          )}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg active:scale-95 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
