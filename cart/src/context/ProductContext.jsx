import { createContext, useState } from "react";
import { products_data } from "../data/products";

export const ProductContext = createContext([]);
export const ProductContextPorvider = ({ children }) => {
  const [produt, setProduct] = useState(products_data);
  const [cart, setCart] = useState([]);

  const addCart = (product) => {
    setCart((oldCart) => {
      let provice = [...oldCart];
      if (provice.length < 1) {
        provice.push({ ...product, quantity: 1 });
      }
    });
  };
  const filterProduct = (category) => {
    const filtedPorduct = products_data.filter((product) => {
      if (category) {
        if (product.category === category) {
          return product;
        }
        setProduct(filtedPorduct);
      } else {
        setProduct(products_data);
      }
    });
  };
  return (
    <ProductContext.Provider value={{ produt, filterProduct }}>
      {children}
    </ProductContext.Provider>
  );
};
