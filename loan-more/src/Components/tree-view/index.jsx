import MenuList from "./MenuList";
import "./styles.css";
function TreeView({ menus = [] }) {
  return (
    <div className="menu-list-container">
      <MenuList list={menus} />
    </div>
  );
}

export default TreeView;
