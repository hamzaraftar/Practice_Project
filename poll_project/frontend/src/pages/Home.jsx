import { useEffect, useState, useRef } from "react";
import API from "../api/auth";
import VoteChart from "../components/VoteChart";
import PermissionPopup from "../components/PermissionPopup";
import { Link } from "react-router-dom";

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

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [userDetails, setUserDetails] = useState(null);

  const openPopup = (msg) => {
    setPopupMessage(msg);
    setShowPopup(true);
  };

  // Build ws URL host/scheme reliably
  const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
  const host =
    window.location.hostname === "localhost"
      ? "localhost:8000"
      : window.location.host;


  const isAuthenticated = () => !!localStorage.getItem("access");
  const getUsername = () =>
    userDetails?.username || localStorage.getItem("username") || "Anonymous";

  // Normalize any incoming message (REST or WS) to the same shape
  const normalizeMessage = (raw) => {
    if (!raw) return null;

    // REST returns { username, content, is_admin, timestamp, user, ... }
    // WS might send { type: 'chat_message', user: '<username>' or user: {username:...}, text: '...' }
    const username =
      raw.username ||
      (raw.user && typeof raw.user === "string" ? raw.user : "") ||
      (raw.user && raw.user.username) ||
      raw.sender ||
      "Anonymous";

    const content = raw.content ?? raw.text ?? raw.message ?? "";
    const is_admin =
      raw.is_admin ?? raw.isAdmin ?? (raw.user && raw.user.is_admin) ?? false;
    const timestamp = raw.timestamp ?? raw.time ?? null;
    const type = raw.type ?? "chat_message";

   
    return {
      type,
      username,
      content,
      is_admin,
      timestamp,
      
      __raw: raw,
    };
  };

  // Fetch polls
  const fetchPolls = async () => {
    try {
      const res = await API.get("polls/");
      setPolls(res.data);
    } catch (err) {      
      if (err?.response?.status === 401) {
        console.warn("Unauthorized while fetching polls");
      } else {
        console.error("Error fetching polls:", err);
      }
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  // Fetch user details (if logged-in)
  const fetchUserDetails = async () => {
    try {
      const res = await API.get("user/");
      setUserDetails(res.data);
      if (res.data?.username) localStorage.setItem("username", res.data.username);
    } catch (err) {
      console.warn("Could not fetch user details", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) fetchUserDetails();
  }, []);

  // Global WS: poll create/delete/vote notifications
  useEffect(() => {
    let ws;
    try {
      ws = new WebSocket(`${wsScheme}://${host}/ws/polls/`);
    } catch (err) {
      console.warn("Could not open global WS", err);
      return;
    }

    ws.onopen = () => {
      console.log("Global WS connected");
      setGlobalSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const typ = raw.type ?? raw.message ?? null;
        if (["vote_update", "poll_update", "poll_created", "poll_deleted"].includes(typ)) {
          fetchPolls();
        }

        // If global socket carries chat messages for a poll_id, add if it matches current poll
        if (raw.type === "chat_message" && raw.poll_id) {
          if (selectedPoll && Number(raw.poll_id) === Number(selectedPoll.id)) {
            setMessages((prev) => [...prev, normalizeMessage(raw)]);
          }
        }
      } catch (err) {
        console.warn("Invalid global WS message", err);
      }
    };

    ws.onerror = (e) => {
      console.warn("Global WS error", e);
    };

    ws.onclose = () => {
      console.log("Global WS closed");
      setGlobalSocket(null);
    };

    return () => {
      try {
        ws.close();
      } catch {}
      setGlobalSocket(null);
    };
    
  }, []);


  // Chat WS per selected poll

  useEffect(() => {
    if (!selectedPoll) {
      setMessages([]);
      if (chatSocket) {
        try {
          chatSocket.close();
        } catch {}
        setChatSocket(null);
      }
      return;
    }

    // fetch chat 
    const fetchHistory = async () => {
      try {
        const res = await API.get(`chat/messages/${selectedPoll.id}/`);
        const arr = Array.isArray(res.data) ? res.data : [];
        setMessages(arr.map((m) => normalizeMessage(m)));
      } catch (err) {
        console.warn("Could not fetch chat history (maybe auth required)", err);
        setMessages([]); // show empty list but not crash
      }
    };
    fetchHistory();

    // open per-poll WS
    let cs;
    try {
      cs = new WebSocket(`${wsScheme}://${host}/ws/chat/${selectedPoll.id}/`);
    } catch (err) {
      console.warn("Could not open chat WS", err);
      openPopup("WebSocket connect error for chat. Check backend.");
      return;
    }

    cs.onopen = () => {
      console.log("Chat WS connected for poll", selectedPoll.id);
      setChatSocket(cs);
    };

    cs.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const normalized = normalizeMessage(raw);

        // Only append real chat messages
        if (normalized.type === "chat_message" && normalized.content?.trim()) {
          setMessages((prev) => [...prev, normalized]);
        }

        // If a vote update came via chat socket, refresh polls
        if (normalized.type === "vote_update") {
          fetchPolls();
        }
      } catch (err) {
        console.warn("Invalid chat WS message", err);
      }
    };

    cs.onerror = (err) => {
      console.warn("Chat WS error", err);
    };

    cs.onclose = () => {
      console.log("Chat WS closed for poll", selectedPoll.id);
      setChatSocket(null);
    };

    setChatSocket(cs);
    return () => {
      try {
        cs.close();
      } catch {}
      setChatSocket(null);
    };    
  }, [selectedPoll]);

  // auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create Poll (server checks admin)
  const createPoll = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      openPopup("Please login to create a poll.");
      return;
    }
    if (!question.trim() || options.some((o) => !o.trim())) {
      openPopup("Please fill question and options");
      return;
    }
    try {
      const res = await API.post("polls/", { question, options });
      setQuestion("");
      setOptions(["", ""]);

      // add locally or refresh
      if (res.data?.poll) setPolls((p) => [res.data.poll, ...p]);
      else if (res.data?.id) setPolls((p) => [res.data, ...p]);
      else await fetchPolls();

      if (globalSocket?.readyState === WebSocket.OPEN) {
        globalSocket.send(JSON.stringify({ type: "poll_update" }));
      }
    } catch (err) {
      console.error("Create poll error:", err);
      openPopup("Create poll failed: " + JSON.stringify(err?.response?.data || err.message));
    }
  };

  // Vote
  const vote = async (optionId) => {
    if (!isAuthenticated()) {
      openPopup("Please login to vote.");
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
      console.error("Vote error:", err);
      openPopup("Vote failed: " + JSON.stringify(err?.response?.data || err.message));
    } finally {
      setLoadingVote(null);
    }
  };

  // Delete poll
  const deletePoll = async (pollId) => {
    if (!isAuthenticated()) {
      openPopup("Only admins can delete polls. Please login.");
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
      openPopup("Delete failed: " + JSON.stringify(err?.response?.data || err.message));
    }
  };

  // Send chat message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      openPopup("Please login to chat.");
      return;
    }
    if (!chatInput.trim()) return;

    // Backend require { type: 'chat_message', text: '...', user: '<username>' }
    const payload = {
      type: "chat_message",
      text: chatInput,
      user: getUsername(),
    };

    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      chatSocket.send(JSON.stringify(payload));
    } else if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
        globalSocket.send(JSON.stringify({ ...payload, poll_id: selectedPoll?.id }));
    } else {
      openPopup("No websocket connected for chat.");
    }

    setMessages((prev) => [
      ...prev,
      {
        type: "chat_message",
        username: getUsername(),
        content: chatInput,
        is_admin: userDetails?.is_admin ?? false,
        timestamp: new Date().toISOString(),
      },
    ]);
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

  // Render
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex justify-between items-center max-w-7xl mx-auto w-full p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="text-blue-600">Live Polling</span> & Chat
        </h1>

        <div className="flex items-center gap-4">
          {!isAuthenticated() ? (
            <>
              <Link to="/login" className="text-blue-600 cursor-pointer">Login</Link>
              <Link to="/register" className="text-blue-600 cursor-pointer">Register</Link>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-700">
                Hi, {getUsername()}
                <span className="text-blue-600 font-semibold">
                  {userDetails?.is_admin && " (Admin)"}
                </span>
              </span>
              <button onClick={logout} className="bg-red-500 text-white px-3 cursor-pointer py-1 rounded">Logout</button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mx-auto w-full max-w-7xl px-6 pb-12">
        {/* Left: Polls & create */}
        <div className="lg:w-2/3 bg-white p-6 rounded shadow">
          {isAuthenticated() && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Create New Poll</h2>
              <form onSubmit={createPoll} className="space-y-3">
                <input type="text" placeholder="Poll question" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full border px-3 py-2 rounded" />
                {options.map((opt, i) => (
                  <input key={i} type="text" placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} className="w-full border px-3 py-2 rounded" />
                ))}
                <div className="flex gap-3">
                  <button type="button" onClick={addOption} className="px-3 py-2 bg-gray-200 cursor-pointer rounded">+ Add</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">Create</button>
                </div>
              </form>
            </div>
          )}

          <h2 className="text-xl font-semibold mb-3">Available Polls</h2>
          <div className="space-y-4">
            {polls.map((poll) => (
              <div key={poll.id} className={`p-4 border rounded ${selectedPoll?.id === poll.id ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}>
                <h3 className="font-semibold mb-2">{poll.question}</h3>
                <span className="text-sm">(Created by {poll.created_by})</span>
                <div className="text-xs text-gray-500">(Created at {new Date(poll.created_at).toLocaleString()})</div>

                <div className="space-y-2 mt-3">
                  {poll.options.map((opt) => (
                    <button key={opt.id} onClick={() => vote(opt.id)} disabled={loadingVote === opt.id} className={`w-full px-4 py-2 rounded text-left flex justify-between items-center cursor-pointer ${loadingVote === opt.id ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600 text-white"} mb-2`}>
                      <span>{opt.text}</span>
                      <span className="font-bold bg-white/20 rounded px-2 py-0.5">{opt.votes_count}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => setSelectedPoll(poll)} className="bg-green-500 text-white px-3 py-1 rounded cursor-pointer">Open Chat</button>
                  {isAuthenticated() && <button onClick={() => deletePoll(poll.id)} className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer">Delete</button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chat & chart */}
        <div className="lg:w-1/3 bg-white p-6 rounded shadow flex flex-col h-[800px]">
          {!selectedPoll ? (
            <div className="flex-1 flex items-center justify-center text-gray-400"><p>Select a poll to open chat & see live results</p></div>
          ) : (
            <>
              <div className="mb-3">
                <h3 className="text-lg font-semibold">{selectedPoll.question}</h3>
                <span>(Created by {selectedPoll.created_by})</span>
                <div className="text-sm text-gray-500"> (Created at {new Date(selectedPoll.created_at).toLocaleString()})</div>
              </div>

              <div className="flex-1 overflow-y-auto border rounded p-3 mb-3 bg-gray-50">
                {messages.filter((m) => m.type === "chat_message" && m.content?.trim()).length === 0 ? (
                  <p className="text-center text-gray-400 mt-10">No messages yet.</p>
                ) : (
                  messages
                    .filter((m) => m.type === "chat_message" && m.content?.trim())
                    .map((m, i) => {
                      const isMine = m.username === getUsername();
                      return (
                        <div key={i} className={`mb-3 flex ${isMine ? "justify-start" : "justify-end"}`}>
                          <div className={`max-w-xs px-4 py-2 rounded-2xl shadow ${isMine ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
                            <strong className="block text-xs mb-1">{m.username} {m.is_admin ? "(Admin)" : ""}</strong>
                            <span>{m.content}</span>
                          </div>
                        </div>
                      );
                    })
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={sendMessage} className="flex gap-2 mb-4">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={isAuthenticated() ? "Type a message..." : "Login to send messages"} className="flex-1 border rounded px-3 py-2" />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 cursor-pointer rounded" disabled={!isAuthenticated()}>Send</button>
              </form>

              <div><VoteChart poll={selectedPoll} /></div>
            </>
          )}
        </div>
      </div>

      {showPopup && <PermissionPopup message={popupMessage} onClose={() => setShowPopup(false)} />}
    </div>
  );
}