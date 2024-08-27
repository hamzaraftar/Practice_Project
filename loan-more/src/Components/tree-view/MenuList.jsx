import React from "react";
import MenuItems from "./MenuItems";

function MenuList({ list = [] }) {
  return (
    <ul className="menu-list-container">
      {list && list.length
        ? list.map((listItems) => <MenuItems item={listItems} />)
        : null}
    </ul>
  );
}

export default MenuList;
