// single selection
//multiple selection
import { useState } from "react";
import data from "./data";
import "./style.css";

const Accordian = () => {
  const [selected, setSelected] = useState(null);
  const [enabelMultiSelection, setEnableMultiSelection] = useState(false);
  const [multiple, setMultiple] = useState([]);

  function handleSingleSelection(id) {
    setSelected(id === selected ? null : id);
  }

  function handleMultiSelection(id) {
    let cpyMultiple = [...multiple];
    const findIndexOfCurrentId = cpyMultiple.indexOf(id);
    console.log(findIndexOfCurrentId);
    if (findIndexOfCurrentId === -1) cpyMultiple.push(id);
    else cpyMultiple.splice(findIndexOfCurrentId, 1);
    setMultiple(cpyMultiple);
  }

  return (
    <div className="wrapper">
      <button onClick={() => setEnableMultiSelection(!enabelMultiSelection)}>
        Enable Multi Seleciton
      </button>
      <div className="accordin">
        {data && data.length > 0 ? (
          data.map((items) => (
            <div className="items" key={data.id}>
              <div
                onClick={
                  enabelMultiSelection
                    ? () => handleMultiSelection(items.id)
                    : () => handleSingleSelection(items.id)
                }
                className="title"
              >
                <h3>{items.question}</h3>
                <span>+</span>
              </div>
              {enabelMultiSelection
                ? multiple.indexOf(items.id) !== -1 && (
                    <div className="content">{items.answer}</div>
                  )
                : selected === items.id && (
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
