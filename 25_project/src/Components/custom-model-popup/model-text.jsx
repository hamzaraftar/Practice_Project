import { useState } from "react";
import Model from "./model";
import "./model.css";
export default function ModelTest() {
  const [modelPopup, setModelPopup] = useState();
  function handleTogglePopup() {
    setModelPopup(!modelPopup);
  }
  function onClose() {
    setModelPopup(false);
  }
  return (
    <div>
      <button onClick={handleTogglePopup}>Open Model Popup</button>
      {modelPopup && <Model onClose={onClose} />}
    </div>
  );
}
