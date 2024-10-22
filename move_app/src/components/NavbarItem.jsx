"use client";
import Link from "next/link";
import React from "react";
import { useSearchParams } from "next/navigation";

export default function NavbarItem({ title, params }) {
  const searchParams = useSearchParams();
  const genre = searchParams.get("genre");
  return (
    <div>
      <Link
        className={` font-semibold ${
          genre === params
            ? `underline-offset-8 decoration-4 decoration-white rounded-lg`
            : ``
        } `}
        href={`/?genre=${params}`}
      >
        {title}
      </Link>
    </div>
  );
}
