import { useEffect, useState } from "react";
const RandomColor = () => {
  const [typeOfColor, setTypeOfColor] = useState("hex");
  const [color, setColor] = useState("#000000");

  function randomColorUlity(length) {
    return Math.floor(Math.random() * length);
  }

  function hancleHexColor() {
    const hex = [1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"];
    let hexColor = "#";
    for (let i = 0; i < 6; i++) {
      hexColor += hex[randomColorUlity(hex.length)];
    }
    setColor(hexColor);
  }

  function hancleRGBColor() {
    const r = randomColorUlity(255);
    const g = randomColorUlity(255);
    const b = randomColorUlity(255);
    setColor(`rgb(${r} ,${g}, ${b})`);
  }

  useEffect(() => {
    if (typeOfColor === "rgb") {
      hancleRGBColor();
    } else hancleHexColor();
  }, [typeOfColor]);

  return (
    <div style={{ width: "100", height: "100vh", background: color }}>
      <button onClick={() => setTypeOfColor("hex")}>Create HEX Color</button>
      <button onClick={() => setTypeOfColor("rgb")}>Create RGB Color</button>
      <button onClick={typeOfColor === "hex" ? hancleHexColor : hancleRGBColor}>
        Generate Random Color
      </button>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
          color: "#fff",
          fontSize: "60px",
          marginTop: "40px",
        }}
      >
        <h3>{typeOfColor === "rgb" ? "RGB Color" : "HEX Color"}</h3>
        <h1>{color}</h1>
      </div>
    </div>
  );
};

export default RandomColor;
