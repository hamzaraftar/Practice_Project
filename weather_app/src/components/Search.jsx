import React from "react";

function Search({ input, setInput, handleSearch }) {
  return (
    <div className="search_engine">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter City Name ..."
      />
      <button onClick={handleSearch}>Search </button>
    </div>
  );
}

export default Search;
