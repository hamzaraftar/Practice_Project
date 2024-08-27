import { useState } from "react";
import MenuList from "./MenuList";
import { FaMinus, FaPlus } from "react-icons/fa";

function MenuItems({ item }) {
  const [displayChilden, setDisplayChilden] = useState({});

  function handleToggleChildern(getLabel) {
    setDisplayChilden({
      ...displayChilden,
      [getLabel]: !displayChilden[getLabel],
    });
  }

  return (
    <li>
      <div style={{ display: "flex", gap: "20px" }}>
        <p>{item.label}</p>
        {item && item.children && item.children.length ? (
          <span className="+" onClick={() => handleToggleChildern(item.label)}>
            {displayChilden[item.label] ? <FaMinus /> : <FaPlus />}
          </span>
        ) : null}
      </div>
      {item &&
      item.children &&
      item.children.length > 0 &&
      displayChilden[item.label] ? (
        <MenuList list={item.children} />
      ) : null}
    </li>
  );
}

export default MenuItems;
