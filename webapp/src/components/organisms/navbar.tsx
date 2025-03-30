"use client";

import { Dropdown, Modal, Navbar } from "flowbite-react";
import { AppImage } from "../atoms/image";
import logotiny from "../../assets/images/logo-blur.webp";
import logo from "../../assets/images/logo.webp";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { PAGE_ROUTES } from "../../utils/constants";
import { useAuth } from "../../hooks/use-auth";
import { HiLogout } from "react-icons/hi";
import { useState } from "react";
import SignUp from "../molecules/sign-up";
import SignIn from "../molecules/sign-in";
import { TbLayoutDashboard } from "react-icons/tb";
import { FaHouseUser } from "react-icons/fa6";

const ProfileDropdown: React.FC = () => {
  const [authAction, setAuthAction] = useState<"login" | "signup" | null>(null);
  const navigate = useNavigate();
  const onCloseModal = () => {
    setAuthAction(null);
  };
  const { user, signOut } = useAuth();

  const onSignInComplete = () => {
    setAuthAction(null);
  };

  const userFirstLetter = (
    user.info.displayName ||
    user.info.email ||
    "p"
  ).charAt(0);

  return (
    <>
      {(user.isAnonymous && (
        <div className="flex flex-row items-center gap-x-2">
          <button
            className="inline-flex items-center gap-x-2 rounded-3xl border border-white px-4 py-3 text-sm font-medium text-white hover:border-red-400 hover:text-red-400 focus:border-red-400 focus:text-red-400 disabled:pointer-events-none disabled:opacity-50"
            onClick={() => setAuthAction("login")}
          >
            Login
          </button>
          <button
            className="inline-flex items-center gap-x-2 rounded-3xl bg-red-400 px-4 py-3 text-sm font-medium text-white hover:bg-white hover:text-red-400 focus:bg-white focus:text-red-400 disabled:pointer-events-none disabled:opacity-50"
            onClick={() => setAuthAction("signup")}
          >
            Signup
          </button>
        </div>
      )) || (
        <Dropdown
          trigger="hover"
          renderTrigger={() => {
            return (
              <AppImage
                src={user.info.photoURL ?? ""}
                alt={userFirstLetter}
                className="h-12 min-h-8 w-12 min-w-8 cursor-pointer rounded-full border-2 border-gray-300"
                fallback={
                  <div
                    className={`flex h-12 min-h-8 w-12 min-w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-red-400/80 font-extrabold text-white`}
                  >
                    {userFirstLetter}
                  </div>
                }
              />
            );
          }}
          label=""
        >
          <div className="text-secondary-950 px-4 py-3 text-sm">
            {user.info.displayName && <div>{user.info.displayName}</div>}
            {user.info.email && (
              <div className="truncate font-medium">{user.info.email}</div>
            )}
          </div>
          <Dropdown.Divider />
          {user.driverInfo && (
            <Dropdown.Item
              icon={TbLayoutDashboard}
              onClick={() => navigate({ to: "/app/driver/dashboard" })}
            >
              Driver Dashboard
            </Dropdown.Item>
          )}
          <Dropdown.Item
            icon={FaHouseUser}
            onClick={() => navigate({ to: "/app/customer/dashboard" })}
          >
            Customer Dashboard
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item icon={HiLogout} onClick={signOut}>
            Sign out
          </Dropdown.Item>
        </Dropdown>
      )}
      <Modal
        show={authAction !== null}
        onClose={onCloseModal}
        size="3xl"
        position="center"
        className="[&>div>div]:bg-white/95 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-end md:[&>div]:h-auto"
      >
        <Modal.Header className="h-12 p-3 text-center">
          {authAction === "login" ? "Login" : "Sign Up"}
        </Modal.Header>
        <Modal.Body>
          <div className="flex w-full flex-row justify-center">
            {authAction === "login" && (
              <div className="space-y-6">
                <SignIn onComplete={onSignInComplete} />
                {user.isAnonymous && (
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    Not registered?&nbsp;
                    <button
                      onClick={() => setAuthAction("signup")}
                      className="text-secondary-900 font-bold hover:underline"
                    >
                      {">>"}Create account
                    </button>
                  </div>
                )}
              </div>
            )}
            {authAction === "signup" && (
              <div className="max-w-md space-y-6">
                <SignUp />
                {user.isAnonymous && (
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    Already have an account?&nbsp;
                    <button
                      onClick={() => setAuthAction("login")}
                      className="text-secondary-950 font-bold hover:underline"
                    >
                      {">>"}Login
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

const AppNavbar: React.FC = () => {
  const router = useRouterState();
  const inactiveClasses =
    "block py-2 px-3 text-secondary-950 rounded-sm hover:bg-red-100 md:hover:bg-transparent md:text-white md:hover:text-red-400 md:p-0";
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
          src={logo}
          alt="logo"
          className="h-auto w-[60px] rounded-full sm:w-[90px] md:w-[110px] lg:w-[150px]"
        />
      </Navbar.Brand>
      <div className="flex gap-5 md:order-2">
        <ProfileDropdown />
      </div>
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
      <Navbar.Collapse
        theme={{
          base: "w-full md:block md:w-auto",
          list: "mt-4 flex flex-col md:mt-0 md:flex-row md:space-x-4 md:text-sm md:font-medium lg:space-x-8",
          hidden: {
            on: "hidden",
            off: "",
          },
        }}
        className="bg-white md:bg-transparent"
      >
        {PAGE_ROUTES.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className={`lg:mx-3 ${
              router.location.pathname === item.href
                ? activeClasses
                : inactiveClasses
            } md:ml-0`}
          >
            {item.name}
          </Link>
        ))}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default AppNavbar;
