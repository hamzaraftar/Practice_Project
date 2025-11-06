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
      if (res.data?.username)
        localStorage.setItem("username", res.data.username);
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
        if (
          [
            "vote_update",
            "poll_update",
            "poll_created",
            "poll_deleted",
          ].includes(typ)
        ) {
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
      openPopup(
        "Create poll failed: " +
          JSON.stringify(err?.response?.data || err.message)
      );
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
      openPopup(
        "Vote failed: " + JSON.stringify(err?.response?.data || err.message)
      );
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
      openPopup(
        "Delete failed: " + JSON.stringify(err?.response?.data || err.message)
      );
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
      globalSocket.send(
        JSON.stringify({ ...payload, poll_id: selectedPoll?.id })
      );
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Live Polling & Chat
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {!isAuthenticated() ? (
                <>
                  <Link
                    to="/login"
                    className="text-slate-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {getUsername().charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-slate-800">
                        Hi, {getUsername()}
                      </div>
                      {userDetails?.is_admin && (
                        <div className="text-xs text-blue-600 font-semibold">
                          Admin
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-slate-100 cursor-pointer hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Polls & Create Poll */}
            <div className="lg:col-span-2 space-y-8">
              {/* Create Poll Card */}
              {isAuthenticated() && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">
                    Create New Poll
                  </h2>
                  <form onSubmit={createPoll} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Enter your poll question..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-3">
                      {options.map((opt, i) => (
                        <input
                          key={i}
                          type="text"
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) =>
                            handleOptionChange(i, e.target.value)
                          }
                          className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={addOption}
                        className="px-4 cursor-pointer py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium"
                      >
                        + Add Option
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-sm"
                      >
                        Create Poll
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Polls List */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Available Polls
                  </h2>
                  <span className="bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-full font-medium">
                    {polls.length} polls
                  </span>
                </div>

                <div className="space-y-4">
                  {polls.map((poll) => (
                    <div
                      key={poll.id}
                      className={`border rounded-xl p-5 transition-all duration-200 ${
                        selectedPoll?.id === poll.id
                          ? "border-blue-300 bg-blue-50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-slate-800 text-lg">
                          {poll.question}
                        </h3>
                        {selectedPoll?.id === poll.id && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-slate-600 mb-4">
                        <span>By {poll.created_by}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(poll.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {poll.options.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => vote(opt.id)}
                            disabled={loadingVote === opt.id}
                            className={`w-full px-4 py-3 rounded-lg cursor-pointer text-left flex justify-between items-center transition-all duration-200 ${
                              loadingVote === opt.id
                                ? "bg-blue-300 cursor-not-allowed"
                                : "bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-sm"
                            }`}
                          >
                            <span className="font-medium">{opt.text}</span>
                            <span className="bg-white/20 rounded-full px-3 py-1 text-sm font-bold min-w-8 text-center">
                              {opt.votes_count}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => setSelectedPoll(poll)}
                          className="flex-1 bg-green-600 cursor-pointer hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-center"
                        >
                          Open Chat
                        </button>
                        {isAuthenticated() && (
                          <button
                            onClick={() => deletePoll(poll.id)}
                            className="px-4 py-2 cursor-pointer bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors duration-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Chat & Chart */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[800px] flex flex-col">
                {!selectedPoll ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <p className="text-center text-slate-500 font-medium">
                      Select a poll to open chat and see live results
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Chat Header */}
                    <div className="p-6 border-b border-slate-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {selectedPoll.question}
                        </h3>
                        <button
                          onClick={() => setSelectedPoll(null)}
                          className="text-slate-400  hover:text-slate-600 transition-colors duration-200 cursor-pointer"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="text-sm text-slate-600">
                        <span>By {selectedPoll.created_by}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(selectedPoll.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                      {messages.filter(
                        (m) => m.type === "chat_message" && m.content?.trim()
                      ).length === 0 ? (
                        <div className="text-center text-slate-400 mt-10">
                          <svg
                            className="w-12 h-12 mx-auto mb-3 opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages
                          .filter(
                            (m) =>
                              m.type === "chat_message" && m.content?.trim()
                          )
                          .map((m, i) => {
                            const isMine = m.username === getUsername();
                            return (
                              <div
                                key={i}
                                className={`mb-4 flex ${
                                  isMine ? "justify-end" : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                    isMine
                                      ? "bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-br-none"
                                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <strong
                                      className={`text-xs font-semibold ${
                                        isMine
                                          ? "text-blue-100"
                                          : "text-slate-600"
                                      }`}
                                    >
                                      {m.username}
                                    </strong>
                                    {m.is_admin && (
                                      <span
                                        className={`text-xs px-1.5 py-0.5 rounded ${
                                          isMine
                                            ? "bg-blue-400 text-white"
                                            : "bg-amber-100 text-amber-700"
                                        }`}
                                      >
                                        Admin
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm">{m.content}</p>
                                </div>
                              </div>
                            );
                          })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <form
                      onSubmit={sendMessage}
                      className="p-4 border-t border-slate-200"
                    >
                      <div className="flex gap-2">
                        <input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={
                            isAuthenticated()
                              ? "Type your message..."
                              : "Please login to send messages"
                          }
                          className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          disabled={!isAuthenticated()}
                        />
                        <button
                          type="submit"
                          className="bg-blue-600  hover:bg-blue-700 text-white px-6 py-3 cursor-pointer rounded-lg font-medium transition-colors duration-200 shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
                          disabled={!isAuthenticated()}
                        >
                          Send
                        </button>
                      </div>
                    </form>

                    {/* Vote Chart */}
                    <div className="p-4 border-t border-slate-200">
                      <VoteChart poll={selectedPoll} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showPopup && (
        <PermissionPopup
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
