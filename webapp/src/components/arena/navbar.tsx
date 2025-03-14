import React from "react";
import { Image } from "../atoms/image";
// import logo from "../../assets/logo.png.webp";
import logotiny from "../../assets/logo.png-blur.webp";
import { Link, useRouterState } from "@tanstack/react-router";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Services", href: "/services" },
  { name: "Tracking", href: "/tracking" },
] as const;

const Navbar: React.FC = () => {
  const router = useRouterState();
  console.log({ p: router.location.pathname });
  const inactiveClasses =
    "block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0";
  const activeClasses =
    "block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0";
  return (
    <>
      <nav className="bg-whitefixed w-full z-20 top-0 start-0 border-b border-gray-200">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a
            href="https://flowbite.com/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img
              src="https://flowbite.com/docs/images/logo.svg"
              className="h-8"
              alt="Flowbite Logo"
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap">
              Flowbite
            </span>
          </a>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
            >
              Get started
            </button>
            <button
              data-collapse-toggle="navbar-sticky"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-controls="navbar-sticky"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-sticky"
          >
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
              {navigation.map((item) => (
                <li>
                  <Link to={item.href} aria-current="page">
                    <a
                      className={
                        router.location.pathname === item.href
                          ? activeClasses
                          : inactiveClasses
                      }
                    >
                      {item.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
      <button
        type="button"
        className="m-1 ms-0 py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-controls="hs-offcanvas-top"
        data-hs-overlay="#hs-offcanvas-top"
      >
        Toggle top offcanvas
      </button>

      <div
        id="hs-offcanvas-top"
        className="hs-overlay hs-overlay-open:translate-y-0 -translate-y-full fixed top-0 inset-x-0 transition-all duration-300 transform max-h-40 size-full z-80 bg-white border-b hidden"
        role="dialog"
        tab-index="-1"
        aria-labelledby="hs-offcanvas-top-label"
      >
        <div className="flex justify-between items-center py-3 px-4 border-b border-gray-200">
          <h3 id="hs-offcanvas-top-label" className="font-bold text-gray-800">
            Offcanvas title
          </h3>
          <button
            type="button"
            className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 disabled:opacity-50"
            aria-label="Close"
            data-hs-overlay="#hs-offcanvas-top"
          >
            <span className="sr-only">Close</span>
            <svg
              className="shrink-0 size-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
        <div className="p-4">
          <p className="text-gray-800">
            Some text as placeholder. In real life you can have the elements you
            have chosen. Like, text, images, lists, etc.
          </p>
        </div>
      </div>
      <header className="flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-white text-sm py-3 ">
        <nav className="max-w-[85rem] w-full mx-auto px-4 flex flex-wrap basis-full items-center justify-between">
          <a
            className="sm:order-1 flex-none text-xl font-semibold focus:outline-hidden focus:opacity-80"
            href="/"
          >
            <Image
              placeholder={logotiny}
              align="center"
              width="150"
              src="{logo}"
              alt="logo"
              className="rounded-full"
            />
          </a>
          <div className="sm:order-3 flex items-center gap-x-2">
            <button
              type="button"
              className="md:hidden hs-collapse-toggle relative size-10 flex justify-center items-center gap-x-2 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none "
              id="hs-navbar-alignment-collapse"
              aria-expanded="false"
              aria-controls="hs-navbar-alignment"
              aria-label="toggle navigation"
              data-hs-collapse="#hs-navbar-alignment"
            >
              <svg
                className="hs-collapse-open:hidden shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentcolor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
              <svg
                className="hs-collapse-open:block hidden shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentcolor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              <span className="sr-only">toggle</span>
            </button>
            <button
              type="button"
              className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-3xl border border-gray-800 text-gray-800 hover:border-gray-500 hover:text-gray-500 focus:outline-hidden focus:border-gray-500 focus:text-gray-500 disabled:opacity-50 disabled:pointer-events-none "
            >
              schedule delivery
            </button>
          </div>
          <div
            id="hs-navbar-alignment"
            className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:grow-0 sm:basis-auto md:block sm:order-2"
            aria-labelledby="hs-navbar-alignment-collapse"
          >
            <div className="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:mt-0 sm:ps-5"></div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
