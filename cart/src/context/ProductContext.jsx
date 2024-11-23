import { createContext, useState } from "react";
import { products_data } from "../data/products";

export const ProductContext = createContext([]);
export const ProductContextPorvider = ({ children }) => {
  const [produt, setProduct] = useState(products_data);
  return (
    <ProductContext.Provider value={{ produt }}>
      {children}
    </ProductContext.Provider>
  );
};
