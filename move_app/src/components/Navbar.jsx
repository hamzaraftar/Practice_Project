import React from "react";
import NavbarItem from "./NavbarItem";
export default function Navbar() {
  return (
    <div className="flex justify-center gap-6  dark:bg-amber-600 bg-amber-100 p-4 lg:text-lg">
      <NavbarItem title="Trending " params="fetch" />
      <NavbarItem title="Top Rated " params="fetchTopRated" />
    </div>
  );
}
