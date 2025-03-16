"use client";

import { Dropdown, Navbar } from "flowbite-react";
import { AppImage } from "../atoms/image";
import logotiny from "../../assets/logo-blur.webp";
import logo from "../../assets/logo.webp";
import { Link, useRouterState } from "@tanstack/react-router";
import { PAGE_ROUTES } from "../../utils/constants";

const AppNavbar: React.FC = () => {
  const router = useRouterState();
  const isOnDeliveryPage = router.location.pathname == "/schedule-delivery";
  const inactiveClasses =
    "block py-2 px-3 text-gray-900 rounded-sm hover:bg-red-100 md:hover:bg-transparent md:text-white md:hover:text-red-400 md:p-0";
  const activeClasses =
    "block py-2 px-3 text-white bg-red-400 rounded-sm md:bg-transparent md:text-red-400 md:p-0 pointer-events-none";
  return (
    <Navbar
      fluid
      rounded
      className="sticky top-0 z-50 bg-transparent p-4 py-1 md:p-0"
    >
      <Navbar.Brand href="/">
        <AppImage
          placeholder={logotiny}
          align="center"
          src={logo}
          alt="logo"
          className="h-auto w-[60px] rounded-full sm:w-[90px] md:w-[110px] lg:w-[150px]"
        />
      </Navbar.Brand>
      {isOnDeliveryPage || (
        <div className="flex sm:gap-5 md:order-2">
          <Link
            to={"/schedule-delivery"}
            type="button"
            className="focus:outline-hidden inline-flex items-center gap-x-2 rounded-3xl border border-white px-4 py-3 text-sm font-medium text-white hover:border-red-400 hover:text-red-400 focus:border-red-400 focus:text-red-400 disabled:pointer-events-none disabled:opacity-50 "
          >
            schedule delivery
          </Link>
        </div>
      )}
      <Dropdown
        label=""
        renderTrigger={() => {
          return (
            <svg
              className="h-10 w-10 cursor-pointer rounded-full p-1 text-white hover:bg-red-400 md:hidden"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          );
        }}
      >
        {PAGE_ROUTES.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className={`min-w-64 ${
              router.location.pathname === item.href
                ? activeClasses
                : inactiveClasses
            }`}
          >
            {item.name}
          </Link>
        ))}
      </Dropdown>
      <Navbar.Collapse className=" bg-white md:bg-transparent">
        {PAGE_ROUTES.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className={
              router.location.pathname === item.href
                ? activeClasses
                : inactiveClasses
            }
          >
            {item.name}
          </Link>
        ))}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default AppNavbar;
