/** @format */

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <header>
      <nav>
        <Link href={"/"} className="logo">
          <Image src={"/icons/logo.png"} alt="logo" width={24} height={24} />
          <p>DevEvent</p>
        </Link>

        <ul>
          <Link
            href={"/"}
            className={pathname === "/" ? "nav-link-active" : ""}>
            Home
          </Link>
          <Link
            href="/events"
            className={pathname === "/events" ? "nav-link-active" : ""}>
            Events
          </Link>
          <Link
            href="/events/create"
            className={pathname === "/events/create" ? "nav-link-active" : ""}>
            Create Event
          </Link>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
