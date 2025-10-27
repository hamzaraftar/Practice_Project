import React, { useEffect, useState } from "react";
import axios from "axios";
import VoteChart from "./Component/VoteChart";

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

  // Global WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`${wsScheme}://${host}/ws/polls/`);
    ws.onopen = () => {
      console.log("Global WS connected");
      setGlobalSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (["poll_created", "poll_deleted", "vote_update"].includes(data.type)) {
        fetchPolls();
      }
    };

    ws.onclose = () => console.log("Global WS closed");
    return () => ws.close();
  }, []);

  // Fetch previous chat messages for a poll
  const fetchChatMessages = async (pollId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/chat/messages/${pollId}/`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching chat messages:", err);
    }
  };

  // Per-poll WebSocket for chat & votes
  useEffect(() => {
    if (!selectedPoll) {
      setMessages([]);
      if (chatSocket) chatSocket.close();
      return;
    }

    // Fetch existing chat history first
    fetchChatMessages(selectedPoll.id);

    // Then, connect WebSocket
    const cs = new WebSocket(`${wsScheme}://${host}/ws/chat/${selectedPoll.id}/`);

    cs.onopen = () => {
      console.log(`Connected to Poll Chat #${selectedPoll.id}`);
      setChatSocket(cs);
    };

    cs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        setMessages((prev) => [...prev, data]);
      } else if (data.type === "vote_update") {
        fetchPolls();
      }
    };

    cs.onclose = () => console.log("Chat WS closed");
    return () => cs.close();
  }, [selectedPoll]);

  // Create Poll
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

      const created = res.data;
      if (created?.id) setPolls((prev) => [created, ...prev]);
      else await fetchPolls();

      if (globalSocket?.readyState === WebSocket.OPEN) {
        globalSocket.send(JSON.stringify({ type: "poll_created" }));
      }
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
      if (globalSocket?.readyState === WebSocket.OPEN)
        globalSocket.send(JSON.stringify({ type: "vote_update" }));
    } catch (err) {
      console.error("Error voting:", err);
    } finally {
      setLoadingVote(null);
    }
  };

  // Delete Poll
  const deletePoll = async (pollId) => {
    try {
      await axios.delete(`http://localhost:8000/api/polls/${pollId}/delete/`);
      setPolls((prev) => prev.filter((p) => p.id !== pollId));

      if (globalSocket?.readyState === WebSocket.OPEN)
        globalSocket.send(JSON.stringify({ type: "poll_deleted" }));

      if (selectedPoll?.id === pollId) {
        setSelectedPoll(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error deleting poll:", err);
    }
  };

  // Send chat message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatSocket) return;
    const msg = { type: "chat_message", text: chatInput, user: "User" };
    chatSocket.send(JSON.stringify(msg));
    setChatInput("");
  };

  const addOption = () => setOptions([...options, ""]);
  const handleOptionChange = (i, value) => {
    const newOps = [...options];
    newOps[i] = value;
    setOptions(newOps);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <h1 className="text-4xl font-bold text-center text-gray-800 mt-6 mb-8">
        Live Polling & Chat App
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 mx-auto w-full max-w-7xl">
        {/* Poll Section - Left Side */}
        <div className="flex-1 bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Create New Poll</h2>
          <form onSubmit={createPoll} className="mb-6">
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
              className="bg-gray-200 px-3 py-1 rounded-lg mb-4"
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

          <h2 className="text-xl font-semibold mb-3">Available Polls</h2>
          <div className="space-y-4">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className={`p-4 border rounded-lg shadow-sm ${
                  selectedPoll?.id === poll.id
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
              >
                <h3 className="font-semibold mb-2">{poll.question}</h3>
                {poll.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => vote(opt.id)}
                    disabled={loadingVote === opt.id}
                    className={`w-full px-4 py-2 rounded-lg text-left flex justify-between items-center ${
                      loadingVote === opt.id
                        ? "bg-blue-300"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    } mb-2`}
                  >
                    {opt.text} <span>{opt.votes_count}</span>
                  </button>
                ))}

                <div className="flex gap-2 mt-2">
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
        </div>

        {/* Chat Section - Right Side */}
        {selectedPoll && (
          <div className="flex-1 flex flex-col bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Chat for: {selectedPoll.question}
            </h2>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50 border p-4 rounded-lg mb-4">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center mt-32">
                  No messages yet.
                </p>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.user === "User" ? "justify-end" : "justify-start"
                    } mb-2`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                        msg.user === "User"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <strong>{msg.user}:</strong> {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat input */}
            <form onSubmit={sendMessage} className="flex gap-2 mb-4">
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

            {/* Chart Section below chat */}
            <div className="mt-6">
              <VoteChart poll={selectedPoll} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
