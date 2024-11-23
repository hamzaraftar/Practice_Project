// import React from 'react'
import { TiAnchor } from "react-icons/ti";
import { NavLink } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";
import { products_categories } from "../data/products";

export default function Navbar() {
  return (
    <div className="w-full h-20  border shadow-lg flex items-center justify-between px-8">
      <div className="flex flex-col items-center">
        <TiAnchor className="text-red-500 text-4xl" />
        <span>@Hamza</span>
      </div>
      <ul className="flex gap-10 items-center">
        {products_categories.map((x) => (
          <li key={x.label}>
            <NavLink to={`/${x.value}`}>{x.value}</NavLink>
          </li>
        ))}
      </ul>
      <div>
        <FaCartShopping className="text-4xl cursor-pointer" />
      </div>
    </div>
  );
}
