import { useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { GlobalContext } from "../context";
export default function Navbar() {
  const { searchParam, setSearchParam, handleSubmit } =
    useContext(GlobalContext);
  return (
    <nav className=" flex justify-between items-center p-8 container mx-auto flex-col lg:flex-row lg:gap-0 ">
      <h2 className="text-2xl font-semibold">
        <Link to={"/"} className="duration-300">
          Food Recipe
        </Link>
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          className="bg-white/75 p-3 px-8 rounded-full outline-none lg:w-96 shadow-lg shadow-red-100 focus:shadow-red-200"
          type="text"
          placeholder="Enter Items ..."
        />
      </form>
      <ul className="flex gap-5">
        <li>
          <NavLink to={"/"} className="duration-200 text-lg font-bold">
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to={"/favorites"} className="duration-200 text-lg font-bold">
            Favorites
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
