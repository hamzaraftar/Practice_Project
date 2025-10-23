import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loadingVote, setLoadingVote] = useState(null);
  const [socket, setSocket] = useState(null);

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
    socket.onmessage = (event) =>
      console.log("📩 Message from server:", event.data);
    socket.onerror = (error) => console.error("⚠️ WebSocket error:", error);
    socket.onclose = () => console.log("❌ WebSocket closed");

    // Send a message after connect to keep connection alive
    setTimeout(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: "ping" }));
      }
    }, 1000);

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

  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Live Polls
      </h1>

      {/* Create Poll Form */}
      <form
        onSubmit={createPoll}
        className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200"
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
      <div className="space-y-4 max-w-2xl mx-auto">
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
    </div>
  );
}

export default App;
