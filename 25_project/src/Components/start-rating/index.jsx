import { FaStar } from "react-icons/fa";
import { useState } from "react";
import "./style.css";

const StarRating = ({ noOFStarts = 5 }) => {
  const [rating, setRatin] = useState(0);
  const [hover, setHover] = useState(0);

  function handleClick(currentIndex) {
    setRatin(currentIndex);
  }

  function handleMouseMove(currentIndex) {
    setHover(currentIndex);
  }

  function handleMouseLeave() {
    setHover(rating);
  }

  return (
    <div className="start-rating">
      {[...Array(noOFStarts)].map((_, index) => {
        index += 1;
        return (
          <FaStar
            key={index}
            className={index <= (hover || rating) ? "active" : "inactive"}
            onClick={() => handleClick(index)}
            onMouseMove={() => handleMouseMove(index)}
            onMouseLeave={() => handleMouseLeave()}
            size={40}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
