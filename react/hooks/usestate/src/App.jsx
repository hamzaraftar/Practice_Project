import { useState } from "react";
import "./App.css";
function App() {
  const [count, setCount] = useState(0);
  return (
    <>
    <h1>Hamza</h1>
      <button onClick={()=>setCount(count+1)}>Count  {count}</button>
    </>
  );
}

export default App;
