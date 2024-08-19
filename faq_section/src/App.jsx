import { useState } from "react";
import "./App.jsx";

function App() {
  const [selected, setSelected] = useState(false);
  function showHide() {
    setSelected(!selected);
  }

  return (
    <>
      {data.map((items) => (
        <div className="w-[450px] rounded-lg m-5 mx-auto border-4 border-blue-400 relative top-40 bg-slate-500 p-2 ">
          <div className="flex justify-center items-center">
            <h3 className="font-semibold text-2xl px-4 ">{items.q}</h3>
            <button
              className="font-semibold text-2xl  px-1 bg-blue-500 rounded-full"
              onClick={showHide}
            >
              {selected ? "-" : "+"}
            </button>
          </div>
          <p className="font-normal text-lg">{selected ? items.ans : ""}</p>
        </div>
      ))}
    </>
  );
}

const data = [
  {
    id: 1,
    q: "What is React JS ?",
    ans: "React is Frontend javascript library which is used for building userinterface based on UI component",
  },
  {
    id: 2,
    q: "Who Develop React JS ?",
    ans: "Jordan Walk",
  },
  {
    id: 3,
    q: "When React JS Deploy ?",
    ans: "React was deploy in 2013",
  },
  {
    id: 4,
    q: "what is Component in React JS ?",
    ans: "Component are independent and reuseable bit of code",
  },
  {
    id: 5,
    q: "Types of component in React JS?",
    ans: "Functional Component and Class component",
  },
];

export default App;
