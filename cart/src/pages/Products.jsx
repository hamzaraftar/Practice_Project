import { useContext } from "react";
import { ProductContext } from "../context/ProductContext";

export default function Products() {
  const { produt } = useContext(ProductContext);

  return (
    <div>
      {produt.map((x) => (
        <div key={x.id}>
          <img src={x.image} alt={x.name} className="w-[300px]" />
        </div>
      ))}
    </div>
  );
}
