import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Card from "./pages/Card";
import Header from "./components/Header";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route />
        <Route path="/" element={<Home />} />
        <Route path="/card" element={<Card />} />
      </Routes>
    </>
  );
}

export default App;
