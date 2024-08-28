import Tabs from "./tabs";
import "./tabs.css";

function TabTest() {
  function handleChange(currrentTabIndex) {
    console.log(currrentTabIndex);
  }

  const tabs = [
    {
      label: "Tab 1",
      content: <div>This is Content of Tab 1</div>,
    },
    {
      label: "Tab 2",
      content: <div>This is Content of Tab 2</div>,
    },
    {
      label: "Tab 3",
      content: <div>This is Content of Tab 3</div>,
    },
  ];
  return (
    <div>
      <Tabs tabsContent={tabs} onChange={handleChange} />
    </div>
  );
}

export default TabTest;
