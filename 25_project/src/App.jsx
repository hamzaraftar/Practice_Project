import "./App.css";
import Accordian from "./Components/accordian";
import QRCodeGenerator from "./Components/qr-code-generator";

import RandomColor from "./Components/random-color";
import StarRating from "./Components/start-rating";

function App() {
  return (
    <>
      {/* <Accordian />
      <RandomColor />
      <StarRating noOFStarts={10} /> */}
      <QRCodeGenerator />
    </>
  );
}

export default App;
