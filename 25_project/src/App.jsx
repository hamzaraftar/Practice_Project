import "./App.css";
import Accordian from "./Components/accordian";
import RandomColor from "./Components/random-color";
import StarRating from "./Components/start-rating";

function App() {
  return (
    <>
      {/* <Accordian /> */}
      {/* <RandomColor /> */}
      <StarRating noOFStarts={10} />
    </>
  );
}

export default App;
