import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loadingVote, setLoadingVote] = useState(null);

  const [selectedPoll, setSelectedPoll] = useState(null);
  const [globalSocket, setGlobalSocket] = useState(null);
  const [chatSocket, setChatSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
  const host =
    window.location.hostname === "localhost"
      ? "localhost:8000"
      : window.location.host;

  // Fetch all polls
  const fetchPolls = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/polls/");
      setPolls(res.data);
    } catch (err) {
      console.error("Error fetching polls:", err);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  // 🌍 Global WebSocket connection (always open)
  useEffect(() => {
    const ws = new WebSocket(`${wsScheme}://${host}/ws/polls/`);

    ws.onopen = () => {
      console.log("✅ Global WS connected");
      setGlobalSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("🌍 Global WS Message:", data);

      if (["poll_created", "poll_deleted", "vote_update"].includes(data.type)) {
        fetchPolls();
      }
    };

    ws.onerror = (err) => console.warn("⚠️ Global WS error:", err);
    ws.onclose = () => console.log("❌ Global WS closed");

    return () => {
      ws.close();
      setGlobalSocket(null);
    };
  }, []);

  // 💬 Per-poll chat WebSocket
  useEffect(() => {
    if (!selectedPoll) {
      if (chatSocket) {
        try {
          chatSocket.close();
        } catch (e) {}
        setChatSocket(null);
      }
      setMessages([]);
      return;
    }

    if (chatSocket) {
      try {
        chatSocket.close();
      } catch (e) {}
      setChatSocket(null);
    }

    const cs = new WebSocket(`${wsScheme}://${host}/ws/chat/${selectedPoll.id}/`);

    cs.onopen = () => {
      console.log(`✅ Connected to Poll Chat #${selectedPoll.id}`);
      setChatSocket(cs);
    };

    cs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 Chat WS Message:", data);

        if (data.type === "chat_message") {
          setMessages((prev) => [...prev, data]);
        } else if (data.type === "vote_update") {
          fetchPolls();
        }
      } catch (err) {
        console.error("Error parsing chat WS message:", err);
      }
    };

    cs.onerror = (e) => console.warn("⚠️ Chat WS error:", e);
    cs.onclose = () => console.log("❌ Chat WS closed");

    return () => {
      try {
        cs.close();
      } catch (e) {}
      setChatSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPoll]);

  // 🧱 Create Poll
  const createPoll = async (e) => {
    e.preventDefault();
    if (!question.trim() || options.some((o) => !o.trim())) {
      alert("Please fill question and options");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/api/polls/", {
        question,
        options,
      });

      setQuestion("");
      setOptions(["", ""]);

      // locally add or re-fetch
      const created = res.data;
      if (created?.id) setPolls((prev) => [created, ...prev]);
      else await fetchPolls();

      // notify via global WS
      if (globalSocket?.readyState === WebSocket.OPEN) {
        globalSocket.send(JSON.stringify({ type: "poll_created" }));
      }
    } catch (err) {
      console.error("Error creating poll:", err);
    }
  };

  // 🗳 Vote
  const vote = async (optionId) => {
    setLoadingVote(optionId);
    try {
      await axios.post("http://localhost:8000/api/vote/", { option: optionId });
      fetchPolls();

      // notify via sockets
      if (globalSocket?.readyState === WebSocket.OPEN) {
        globalSocket.send(JSON.stringify({ type: "vote_update" }));
      }
      if (chatSocket?.readyState === WebSocket.OPEN) {
        chatSocket.send(JSON.stringify({ type: "vote_update" }));
      }
    } catch (err) {
      console.error("Error voting:", err);
    } finally {
      setLoadingVote(null);
    }
  };

  // 🗑 Delete Poll
  const deletePoll = async (pollId) => {
    try {
      await axios.delete(`http://localhost:8000/api/polls/${pollId}/delete/`);
      setPolls((prev) => prev.filter((p) => p.id !== pollId));

      if (globalSocket?.readyState === WebSocket.OPEN) {
        globalSocket.send(JSON.stringify({ type: "poll_deleted" }));
      }

      if (selectedPoll?.id === pollId) {
        setSelectedPoll(null);
        setMessages([]);
        if (chatSocket) chatSocket.close();
      }
    } catch (err) {
      console.error("Error deleting poll:", err);
    }
  };

  // 💬 Send chat message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatSocket) return;

    const msg = { type: "chat_message", text: chatInput, user: "User" };
    if (chatSocket.readyState === WebSocket.OPEN) {
      chatSocket.send(JSON.stringify(msg));
      setChatInput("");
    }
  };

  const addOption = () => setOptions([...options, ""]);
  const handleOptionChange = (i, value) => {
    const newOps = [...options];
    newOps[i] = value;
    setOptions(newOps);
  };

  // -----------------------
  // JSX
  // -----------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Live Polls + Chat</h1>

      {/* Create Poll */}
      <form
        onSubmit={createPoll}
        className="max-w-xl w-full bg-white shadow-md rounded-lg p-6 mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Create New Poll</h2>
        <input
          type="text"
          placeholder="Poll question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4"
        />
        {options.map((opt, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => handleOptionChange(i, e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
          />
        ))}
        <button
          type="button"
          onClick={addOption}
          className="bg-gray-300 px-3 py-1 rounded-lg mb-4"
        >
          + Add Option
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 w-full rounded-lg"
        >
          Create Poll
        </button>
      </form>

      {/* Poll List */}
      <div className="space-y-4 max-w-2xl w-full mb-10">
        {polls.map((poll) => (
          <div
            key={poll.id}
            className={`p-4 bg-white rounded-lg shadow-md border ${
              selectedPoll?.id === poll.id
                ? "border-blue-500"
                : "border-gray-200"
            }`}
          >
            <h3 className="text-lg font-semibold mb-2">{poll.question}</h3>
            <div className="space-y-2">
              {poll.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => vote(opt.id)}
                  disabled={loadingVote === opt.id}
                  className={`w-full px-4 py-2 rounded-lg text-left flex justify-between items-center ${
                    loadingVote === opt.id
                      ? "bg-blue-300"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {opt.text} <span>{opt.votes_count}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSelectedPoll(poll)}
                className="bg-green-500 text-white px-3 py-1 rounded-lg"
              >
                Open Chat
              </button>
              <button
                onClick={() => deletePoll(poll.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Chat */}
      {selectedPoll && (
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3">
            Chat for: {selectedPoll.question}
          </h2>
          <div className="h-64 overflow-y-auto bg-gray-50 p-2 rounded-lg mb-3">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center mt-20">No messages yet.</p>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className="bg-blue-100 px-3 py-2 rounded-lg mb-2 shadow-sm"
                >
                  <span className="font-semibold text-blue-700">{msg.user}: </span>
                  {msg.text}
                </div>
              ))
            )}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
