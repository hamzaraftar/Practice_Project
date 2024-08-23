// single selection
//multiple selection
import { useState } from "react";
import data from "./data";
import "./style.css";

const Accordian = () => {
  const [selected, setSelected] = useState(null);

  function handleSingleSelection(id) {
    setSelected(id === selected ? null : id);
  }
  console.log(selected);

  return (
    <div className="wrapper">
      <div className="accordin">
        {data && data.length > 0 ? (
          data.map((items) => (
            <div className="items" key={data.id}>
              <div
                onClick={() => handleSingleSelection(items.id)}
                className="title"
              >
                <h3>{items.question}</h3>
                <span>+</span>
              </div>
              {selected === items.id && (
                <div className="content">{items.answer}</div>
              )}
            </div>
          ))
        ) : (
          <div>No data found</div>
        )}
      </div>
    </div>
  );
};

export default Accordian;
