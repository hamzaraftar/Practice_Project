import "./App.css";
import Header from "./Components/Header";
import Users from "./Components/Users";

function App() {
  return (
    <>
      <div className="bg-slate-300 h-[100%] ">
        <div className="max-w-6xl mx-auto">
          <Header />
          <Users />
        </div>
      </div>
    </>
  );
}

export default App;
