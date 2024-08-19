import "./App.css";
import Header from "./Components/Header";
import Input from "./Components/Input";

function App() {
  return (
    <>
      <main className="bg-slate-600 h-screen">
        <div className="bg-white max-w-sm rounded-xl shadow-xl mx-auto h-[600px] relative top-32">
          <Header />
          <Input />
        </div>
      </main>
    </>
  );
}

export default App;
