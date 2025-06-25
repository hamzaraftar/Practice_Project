import React, { useState } from "react";

export default function Obj() {
  const [name, setName] = useState({ firstName: "", lastName: "" });
  return (
    <div>
      <form>
        <input
          value={name.firstName}
          onChange={(e) => setName({...name, firstName: e.target.value })}
          type="text"
          placeholder="First Name"
        />
        <input
          value={name.lastName}
          onChange={(e) => setName({ ...name,lastName: e.target.value })}
          type="text"
          placeholder="Last Name"
        />
        <h2>Your first name is : {name.firstName}</h2>
        <h2>Your first name is : {name.lastName}</h2>
      </form>
    </div>
  );
}
