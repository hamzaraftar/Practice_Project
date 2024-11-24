import { useContext } from "react";
import { ProductContext } from "../context/ProductContext";

export default function Products() {
  const { produt } = useContext(ProductContext);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4   m-10 ">
      {produt.map((product) => (
        <div
          key={product.id}
          className=" rounded-r-xl border p-4 hover:shadow-xl mx-auto "
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-[200px] h-[150px] object-contain block mx-auto "
          />
          {/* Porduct info */}
          <div className="flex flex-col gap-4 items-center my-4">
            <p className="text-center font-bold">{product.name}</p>
            <p className="text-center font-bold">{product.price}</p>
            <p className="text-xs text-gray-500 ">{product.smallDescription}</p>
          </div>
          <button className="w-full bg-blue-600 text-white text-center text-sm p-2 rounded-lg active:bg-blue-700">
            + Add To Cart
          </button>
        </div>
      ))}
    </div>
  );
}
