import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Card() {
  const [totalCart, setTotalCart] = useState(0);
  const { cart } = useSelector((state) => state);
  useEffect(() => {
    setTotalCart(cart.reduce((acc, curr) => acc + curr.price, 0));
  }, [cart]);
  return (
    <div>
      <h1>hamza</h1>
    </div>
  );
}
