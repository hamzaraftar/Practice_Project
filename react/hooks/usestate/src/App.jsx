import { useState } from "react";
import "./App.css";
import Obj from "./objects/obj";
function App() {
  const [count, setCount] = useState(0);
  return (
    <>
    
      {/* <h2 onClick={()=>setCount(count+1)}>Count  {count}</h2> */}
      <Obj/>
    </>
  );
}

export default App;
