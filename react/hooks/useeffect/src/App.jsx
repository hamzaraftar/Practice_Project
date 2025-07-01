import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title= `you click ${count}`
  });
  return (
    <>
      <button onClick={() => setCount(count + 1)}> Count {count} times</button>
    </>
  );
}

export default App;
