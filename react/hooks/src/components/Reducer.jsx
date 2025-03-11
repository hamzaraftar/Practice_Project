import React, { useReducer } from "react";

const initialState = {
    fistCounter : 0,
};
const reducer = (state, action) => {
  switch (action.type) {
    case "increment":
      return {fistCounter : state.fistCounter + 1};
    case "decrement":
      return {fistCounter : state.fistCounter - 1};
    case "reset":
      return initialState;

    default:
      break;
  }
};


export default function Reducer() {
  const [count, dispatch] = useReducer(reducer, initialState);
  return (
    <div>
      <h1> Count :  {count.fistCounter}</h1>
      <button onClick={ ()=> {dispatch({type:'increment'})} }>Increment</button><br />
      <button onClick={ ()=> {dispatch({type:'decrement'})} }>Decrement</button><br />
      <button onClick={ ()=> {dispatch({type:'reset'})} }>Reset</button>
    </div>
  );
}
