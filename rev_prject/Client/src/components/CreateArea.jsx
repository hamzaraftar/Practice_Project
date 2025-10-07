import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import Zoom from "@mui/material/Zoom";

function CreateArea({ refreshNotes }) {
  const [isExpended, setExpended] = useState(false);
  const [note, setNote] = useState({
    title: "",
    description: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setNote((prevNote) => ({
      ...prevNote,
      [name]: value,
    }));
  }

  async function submitNote(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/todos/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });

      if (!res.ok) {
        throw new Error(`Failed to upload note, status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Note saved:", data);

      setNote({ title: "", description: "" }); // clear input

      // 🔥 call parent function to reload notes
      if (refreshNotes) {
        refreshNotes();
      }
    } catch (err) {
      console.error("Error submitting:", err);
    }
  }

  function Expend() {
    setExpended(true);
  }

  return (
    <div>
      <form className="create-note" onSubmit={submitNote}>
        {isExpended && (
          <input
            name="title"
            onChange={handleChange}
            value={note.title}
            placeholder="Title"
          />
        )}

        <textarea
          onClick={Expend}
          name="description"
          onChange={handleChange}
          value={note.description}
          placeholder="Take a note..."
          rows={isExpended ? 3 : 1}
        />

        <Zoom in={isExpended}>
          <button type="submit">
            <AddIcon />
          </button>
        </Zoom>
      </form>
    </div>
  );
}

export default CreateArea;
