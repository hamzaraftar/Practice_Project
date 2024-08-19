import { useState } from "react";

const Input = () => {
  const [value, setvalue] = useState("");
  const [list, setList] = useState([]);
  function handleClick() {
    setList([value, ...list]);
    setvalue("");
  }
  function handleDelete(items) {
    console.log(`Button is clicked for ${items}`);
    setList(list.filter((todo) => todo !== items));
  }

  return (
    <div className="text-center mt-10">
      <input
        className="outline-none rounded-sm py-1 my-2 -sm border-b-4 border-yellow-500 mx-3 px-5 "
        type="text"
        placeholder="ADD TODO ITEMS"
        value={value}
        onChange={(e) => setvalue(e.target.value)}
      />
      <button
        className=" bg-yellow-500  px-2 rounded-full hover:bg-green-700 text-white text-center text-lg font-semibold"
        onClick={handleClick}
      >
        +
      </button>
      <ol className=" text-center relative top-10">
        {list.map((items, index) => (
          <li
            key={items}
            onClick={() => handleDelete(items)}
            className="hover:text-red-700 font-medium text-2xl cursor-pointer"
          >
            {items}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Input;
