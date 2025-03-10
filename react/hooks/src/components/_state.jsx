import React from "react";
import { useState } from "react";

export default function State() {
  const [name, setName] = useState({
    firstName: "",
    lastName: "",
  });
  return (
    <div>
      <input
        type="text"
        value={name.firstName}
        onChange={(e) => setName({ ...name, firstName: e.target.value })}
      />
      <input
        type="text"
        value={name.lastName}
        onChange={(e) => setName({ ...name, lastName: e.target.value })}
      />
      <h2>
        Your fist name is {name.firstName} and last name {name.lastName}
      </h2>
    </div>
  );
}
