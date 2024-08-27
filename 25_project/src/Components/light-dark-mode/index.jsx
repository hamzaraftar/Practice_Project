import React from "react";
import useLocalStroage from "./UseLocalStorage";
import "./theme.css";

function LigtDarkMode() {
  const [theme, setTheme] = useLocalStroage("theme", "dark");

  function handleToggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <div className="light-dark-mode" data-theme={theme}>
      <div className="container">
        <p>Hello Hamza : )</p>
        <button onClick={handleToggleTheme}>Change Theme</button>
      </div>
    </div>
  );
}

export default LigtDarkMode;
