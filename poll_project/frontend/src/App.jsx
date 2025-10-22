import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]); // start with 2 options

  // Fetch polls from backend
  const fetchPolls = async () => {
    const res = await axios.get("http://localhost:8000/api/polls/");
    setPolls(res.data);
  };

  // Vote for an option
  const vote = async (optionId) => {
    await axios.post("http://localhost:8000/api/vote/", { option: optionId });
    fetchPolls();
  };

  // Delete a poll
  const deletePoll = async (pollId) => {
    await axios.delete(`http://localhost:8000/api/polls/${pollId}/`);
    fetchPolls();
  };

  // Add option input dynamically
  const addOption = () => setOptions([...options, ""]);

  // Handle option text change
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Create a new poll
  const createPoll = async () => {
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      alert("Question and all options are required");
      return;
    }

    await axios.post("http://localhost:8000/api/polls/", {
      question,
      options,
    });

    setQuestion("");
    setOptions(["", ""]); // reset form
    fetchPolls();
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Live Polls</h1>

      {/* Create Poll Section */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-3">Create New Poll</h2>
        <input
          type="text"
          placeholder="Poll Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        {options.map((opt, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={opt}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            className="w-full mb-2 p-2 border rounded"
          />
        ))}
        <button
          onClick={addOption}
          className="mb-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
        >
          + Add Option
        </button>
        <br />
        <button
          onClick={createPoll}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
        >
          Create Poll
        </button>
      </div>

      {/* Poll List */}
      <div className="space-y-4">
        {polls.map((poll) => (
          <div
            key={poll.id}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
          >
            <h3 className="text-xl font-semibold mb-3">{poll.question}</h3>
            <div className="space-y-2">
              {poll.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => vote(opt.id)}
                  className="w-full text-left px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex justify-between items-center"
                >
                  {opt.text}{" "}
                  <span className="font-bold">{opt.votes_count}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => deletePoll(poll.id)}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
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
