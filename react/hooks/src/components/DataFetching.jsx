// import React, { useReducer, useEffect } from "react";
// import axios from "axios";

// const initialState = {
//   loading: true,
//   error: "",
//   post: {},
// };

// const reducer = (state, action) => {
//   switch (action.type) {
//     case "FETCH_SUCCESS":
//       return { loading: false, post: action.payload, error: "" };

//     case "FETCH_ERROR":
//       return { loading: false, post: {}, error: "Something went wrong!" };

//     default:
//         return state;
//   }
// };

// export default function DataFetching() {
//     const [state, dispatch] = useReducer(reducer, initialState);

//     useEffect( ()  => {
//         const res = axios
//     }, []);
//   return <div>DataFetching</div>;
// }
