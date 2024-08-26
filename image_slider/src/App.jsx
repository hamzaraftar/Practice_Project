import "./App.css";
import ImageSlider from "./components";

function App() {
  return (
    <>
      <ImageSlider
        url={"https://picsum.photos/v2/list"}
        limit={"10"}
        page={"1"}
      />
    </>
  );
}

export default App;
