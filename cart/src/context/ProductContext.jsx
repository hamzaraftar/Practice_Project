import { createContext, useState } from "react";
import { products_data } from "../data/products";

export const ProductContext = createContext([]);
export const ProductContextPorvider = ({ children }) => {
  const [produt, setProduct] = useState(products_data);
  const filter = (category) => {
    const filterPorduct = products_data.map((product) => {
      product.category === category;
    });
  };
  return (
    <ProductContext.Provider value={{ produt }}>
      {children}
    </ProductContext.Provider>
  );
};
