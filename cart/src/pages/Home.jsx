// import React from "react";
import { useContext, useEffect } from "react";

import { ProductContext } from "../context/ProductContext";
import { useParams } from "react-router-dom";

export default function Home() {
  const { category } = useParams();
  const { filterProduct } = useContext(ProductContext);

  useEffect(() => {
    filterProduct(category);
  }, [category]);
  return (
    <div className="h-screen">
      <div className="w-[80%] mx-auto my-4"></div>
    </div>
  );
}
