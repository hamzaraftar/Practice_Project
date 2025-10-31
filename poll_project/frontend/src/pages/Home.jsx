// src/pages/Home.jsx
import { useEffect, useState, useRef } from "react";
import API from "../api/auth";
import VoteChart from "../components/VoteChart";

export default function Home() {
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loadingVote, setLoadingVote] = useState(null);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [globalSocket, setGlobalSocket] = useState(null);
  const [chatSocket, setChatSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
  const host =
    window.location.hostname === "localhost"
      ? "localhost:8000"
      : window.location.host;

  const fetchPolls = async () => {
    try {
      const res = await API.get("polls/"); // public endpoint
      setPolls(res.data);
    } catch (err) {
      console.error("Error fetching polls:", err);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  // Global WS for polls (create/vote/delete notifications)
  useEffect(() => {
    const ws = new WebSocket(`${wsScheme}://${host}/ws/polls/`);
    ws.onopen = () => {
      console.log("Global WS connected");
      setGlobalSocket(ws);
    };
    ws.onmessage = (event) => {
      try {
        const d = JSON.parse(event.data);
        if (["vote_update", "poll_update", "poll_created", "poll_deleted"].includes(d.type || d.message)) {
          fetchPolls();
        }
      } catch (e) {
        console.warn("Invalid global WS message", e);
      }
    };
    ws.onclose = () => console.log("Global WS closed");
    ws.onerror = (e) => console.warn("Global WS error", e);

    setGlobalSocket(ws);
    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chat WS per selectedPoll
  useEffect(() => {
    if (!selectedPoll) {
      setMessages([]);
      if (chatSocket) {
        chatSocket.close();
        setChatSocket(null);
      }
      return;
    }

    // fetch history from REST (if available)
    const fetchHistory = async () => {
      try {
        const res = await API.get(`chat/messages/${selectedPoll.id}/`);
        setMessages(res.data || []);
      } catch (err) {
        console.warn("Could not fetch chat history (maybe auth required?)", err);
      }
    };
    fetchHistory();

    const cs = new WebSocket(`${wsScheme}://${host}/ws/chat/${selectedPoll.id}/`);
    cs.onopen = () => {
      console.log("Chat WS connected for poll", selectedPoll.id);
      setChatSocket(cs);
    };
    cs.onmessage = (event) => {
      try {
        const d = JSON.parse(event.data);
        if (d.type === "chat_message") {
          setMessages((prev) => [...prev, d]);
        }
        if (d.type === "vote_update") {
          fetchPolls();
        }
      } catch (err) {
        console.warn("Invalid chat WS message", err);
      }
    };
    cs.onclose = () => console.log("Chat WS closed");
    cs.onerror = (e) => console.warn("Chat WS error", e);

    setChatSocket(cs);
    return () => cs.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPoll]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isAuthenticated = () => !!localStorage.getItem("access");
  const getUsername = () => localStorage.getItem("username") || "Anonymous";

  // Create poll (admins only - backend will validate)
  const createPoll = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      alert("Please login to create a poll.");
      return;
    }
    if (!question.trim() || options.some((o) => !o.trim())) {
      alert("Please fill question and options");
      return;
    }
    try {
      const res = await API.post("polls/", { question, options });
      setQuestion("");
      setOptions(["", ""]);
      // push to local list quickly
      if (res.data?.poll) {
        setPolls((p) => [res.data.poll, ...p]);
      } else if (res.data?.id) {
        setPolls((p) => [res.data, ...p]);
      } else {
        await fetchPolls();
      }
      // notify others
      if (globalSocket?.readyState === WebSocket.OPEN) {
        globalSocket.send(JSON.stringify({ type: "poll_update" }));
      }
    } catch (err) {
      console.error("Error creating poll:", err);
      const detail = err?.response?.data || err.message;
      alert("Create poll failed: " + JSON.stringify(detail));
    }
  };

  const vote = async (optionId) => {
    if (!isAuthenticated()) {
      alert("Please login to vote.");
      return;
    }
    setLoadingVote(optionId);
    try {
      await API.post("vote/", { option: optionId });
      fetchPolls();
      if (globalSocket?.readyState === WebSocket.OPEN) {
        globalSocket.send(JSON.stringify({ type: "vote_update" }));
      }
    } catch (err) {
      console.error("Error voting:", err);
      alert("Vote failed: " + JSON.stringify(err?.response?.data || err.message));
    } finally {
      setLoadingVote(null);
    }
  };

  const deletePoll = async (pollId) => {
    if (!isAuthenticated()) {
      alert("Only admins can delete polls. Please login.");
      return;
    }
    if (!window.confirm("Delete poll?")) return;
    try {
      await API.delete(`polls/${pollId}/delete/`);
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
      if (globalSocket?.readyState === WebSocket.OPEN) {
        globalSocket.send(JSON.stringify({ type: "poll_update" }));
      }
      if (selectedPoll?.id === pollId) {
        setSelectedPoll(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed: " + JSON.stringify(err?.response?.data || err.message));
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      alert("Please login to chat.");
      return;
    }
    if (!chatInput.trim()) return;
    const payload = {
      type: "chat_message",
      text: chatInput,
      user: getUsername(),
    };
    // prefer chatSocket
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      chatSocket.send(JSON.stringify(payload));
    } else if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
      // fallback: send via global socket (include poll id)
      globalSocket.send(JSON.stringify({ ...payload, poll_id: selectedPoll?.id }));
    } else {
      alert("No websocket connected for chat.");
    }
    setChatInput("");
  };

  const addOption = () => setOptions((o) => [...o, ""]);
  const handleOptionChange = (i, val) => {
    const copy = [...options];
    copy[i] = val;
    setOptions(copy);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex justify-between items-center max-w-7xl mx-auto w-full p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="text-blue-600">Live Polling</span> & Chat
        </h1>

        <div className="flex items-center gap-4">
          {!isAuthenticated() ? (
            <>
              <a href="/login" className="text-blue-600">Login</a>
              <a href="/register" className="text-blue-600">Register</a>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-700">Hi, {getUsername()}</span>
              <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mx-auto w-full max-w-7xl px-6 pb-12">
        {/* Left: Polls & create */}
        <div className="lg:w-2/3 bg-white p-6 rounded shadow">
          {/* Create Poll (only show if logged-in — admin backend will check) */}
          {isAuthenticated() && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Create New Poll</h2>
              <form onSubmit={createPoll} className="space-y-3">
                <input
                  type="text"
                  placeholder="Poll question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
                {options.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  />
                ))}
                <div className="flex gap-3">
                  <button type="button" onClick={addOption} className="px-3 py-2 bg-gray-200 rounded">+ Add</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
                </div>
              </form>
            </div>
          )}

          <h2 className="text-xl font-semibold mb-3">Available Polls</h2>
          <div className="space-y-4">
            {polls.map((poll) => (
              <div key={poll.id} className={`p-4 border rounded ${selectedPoll?.id === poll.id ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}>
                <h3 className="font-semibold mb-2">{poll.question}</h3>

                <div className="space-y-2">
                  {poll.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => vote(opt.id)}
                      disabled={loadingVote === opt.id}
                      className={`w-full px-4 py-2 rounded text-left flex justify-between items-center ${loadingVote === opt.id ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                    >
                      <span>{opt.text}</span>
                      <span className="font-bold bg-white/20 rounded px-2 py-0.5">{opt.votes_count}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => setSelectedPoll(poll)} className="bg-green-500 text-white px-3 py-1 rounded">Open Chat</button>
                  {isAuthenticated() && (
                    <button onClick={() => deletePoll(poll.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chat & chart */}
        <div className="lg:w-1/3 bg-white p-6 rounded shadow flex flex-col h-[700px]">
          {!selectedPoll ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>Select a poll to open chat & see live results</p>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <h3 className="text-lg font-semibold">{selectedPoll.question}</h3>
                <p className="text-sm text-gray-500">Poll ID: {selectedPoll.id}</p>
              </div>

              <div className="flex-1 overflow-y-auto border rounded p-3 mb-3 bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-400 mt-10">No messages yet.</p>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className={`mb-2 ${m.user === getUsername() ? "text-right" : ""}`}>
                      <div className={`inline-block px-4 py-2 rounded-2xl ${m.user === getUsername() ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}>
                        <strong className="block text-xs text-gray-700">{m.user}</strong>
                        <span>{m.text}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={sendMessage} className="flex gap-2 mb-4">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isAuthenticated() ? "Type a message..." : "Login to send messages"}
                  className="flex-1 border rounded px-3 py-2"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!isAuthenticated()}>
                  Send
                </button>
              </form>

              <div>
                <VoteChart poll={selectedPoll} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
