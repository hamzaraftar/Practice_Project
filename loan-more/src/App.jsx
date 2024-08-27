// import LoadMoreData from "./Components";
import menus from "./Components/tree-view/data";
import TreeView from "./Components/tree-view";

function App() {
  return (
    <>
      {/* <LoadMoreData /> */}
      <TreeView menus={menus} />
    </>
  );
}

export default App;
