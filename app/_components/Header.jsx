"use client";

import { Button } from "@/components/ui/button";
import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { Plus, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import RentBikeModal from "../RentBikeModal/RentBikeModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Modal from "../modal/modal";

function Header() {
  const path = usePathname();
  const { user, isSignedIn } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (user && user.publicMetadata.role) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="p-6 px-10 flex justify-between shadow-sm fixed top-0 w-full z-10 bg-white">
      <div className="flex gap-6 items-center">
      <Modal />
        <Link href={"/"}>
          <Image src="/123.png" width={70} height={80} alt="logo" />
        </Link>
        <div className="hidden md:flex gap-10 items-center">
          {!isAdmin && (
            <>
              <Link href={"/"}>
                <span
                  className={`hover:text-primary font-medium text-sm cursor-pointer ${
                    path == "/" && "text-primary"
                  }`}
                >
                  Rent
                </span>
              </Link>
              <Link href={"/RentDashboard"}>
                <span className="hover:text-primary font-medium text-sm cursor-pointer">
                  Rental Dashboard
                </span>
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link href={"/"}>
                <span
                  className={`hover:text-primary font-medium text-sm cursor-pointer ${
                    path == "/" && "text-primary"
                  }`}
                >
                  Bike Dashboard
                </span>
              </Link>
              <Link href={"/users-dashboard"}>
                <span className="hover:text-primary font-medium text-sm cursor-pointer">
                  Users
                </span>
              </Link>
              <Link href={"/transaction-history"}>
                <span className="hover:text-primary font-medium text-sm cursor-pointer">
                  Transaction History
                </span>
              </Link>
              <Link href={"/report-track"}>
                <span className="hover:text-primary font-medium text-sm cursor-pointer">
                  Reported Issues
                </span>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2 items-center">
        {isAdmin && (
          <Link href={"/add-new-bikes"}>
            <Button className="flex gap-2">
              <Plus className="h-5 w-5" /> Add Bikes
            </Button>
          </Link>
        )}

        {isSignedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <UserButton showName />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={"/user"}> Profile </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SignOutButton>Logout</SignOutButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href={"/sign-in"}>
            <Button variant="outline">Login</Button>
          </Link>
        )}

        {/* Hamburger Menu for Small Screens */}
        <button
          className="md:hidden flex items-center justify-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Dropdown Menu for Small Screens */}
      {isMenuOpen && (
        <div ref={menuRef} className="absolute top-16 right-6 bg-white shadow-lg rounded-lg p-4 z-20 w-64 md:hidden">
          <ul className="flex flex-col gap-4">
            {!isAdmin && (
              <>
                <Link href={"/"}>
                  <li
                    onClick={() => setIsMenuOpen(false)}
                    className={`hover:text-primary font-medium text-sm cursor-pointer ${
                      path == "/" && "text-primary"
                    }`}
                  >
                    Rent
                  </li>
                </Link>
                <Link href={"/RentDashboard"}>
                  <li
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:text-primary font-medium text-sm cursor-pointer"
                  >
                    Rental Dashboard
                  </li>
                </Link>
              </>
            )}
            {isAdmin && (
              <>
                <Link href={"/"}>
                  <li
                    onClick={() => setIsMenuOpen(false)}
                    className={`hover:text-primary font-medium text-sm cursor-pointer ${
                      path == "/" && "text-primary"
                    }`}
                  >
                    Bike Dashboard
                  </li>
                </Link>
                <Link href={"/users-dashboard"}>
                  <li
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:text-primary font-medium text-sm cursor-pointer"
                  >
                    Users
                  </li>
                </Link>
                <Link href={"/transaction-history"}>
                  <li
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:text-primary font-medium text-sm cursor-pointer"
                  >
                    Transaction History
                  </li>
                </Link>
                <Link href={"/report-track"}>
                  <li
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:text-primary font-medium text-sm cursor-pointer"
                  >
                    Reported Issues
                  </li>
                </Link>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Header;
