import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";

function App() {
  const [notes, setNotes] = useState([]);

  const getKeep = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/todos/"); // ✅ FIXED
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Fetch error:", err.message);
    }
  };

  useEffect(() => {
    getKeep();
  }, []);

  async function deleteNote(id) {
    try {
      const res = await fetch(`http://127.0.0.1:8000/todos/${id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
        console.log(`Deleted note ${id}`);
      } else {
        console.error("Failed to delete note", res.status);
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
  }

  return (
    <div>
      <Header />
      <CreateArea refreshNotes={getKeep} />
      {notes.map((noteItem) => (
        <Note
          id={noteItem.id}
          key={noteItem.id}
          title={noteItem.title}
          content={noteItem.description}
          onDelete={deleteNote}
        />
      ))}
      <Footer />
    </div>
  );
}

export default App;
