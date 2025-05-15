import { useNavigate } from "@tanstack/react-router";
import { Avatar } from "flowbite-react";
import React from "react";
import { BsBicycle } from "react-icons/bs";
import { HiUser } from "react-icons/hi";
import { IoLogOutOutline } from "react-icons/io5";
import { SecondaryButton } from "~/components/atoms";
import { useAuth } from "~/hooks/use-auth";

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const logOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="my-6 flex w-full max-w-3xl flex-col rounded-lg bg-white p-4 shadow sm:flex-row">
      <div className="relative mb-4 text-center sm:mb-0 sm:mr-6">
        <Avatar
          placeholderInitials={user.info.displayName.trim().charAt(0)}
          img={user.info.photoURL || ""}
          rounded
          size="lg"
        />
      </div>
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <h1 className="text-2xl font-bold">{user.info.displayName}</h1>
        <p className="text-gray-600">{user.info.email}</p>
        <div className="mt-1 flex items-center justify-center text-center sm:text-left">
          <span className="mr-2 font-light opacity-70">
            #{user.info.uid.slice(0, 6)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-row items-center justify-center gap-2 sm:flex-col sm:items-end sm:justify-end">
        {user.driverInfo && (
          <SecondaryButton
            className="border-none bg-transparent px-2 py-2 underline xs:shadow-none"
            onClick={() => navigate({ to: "/app/driver/dashboard" })}
          >
            <BsBicycle className="text-lg text-primary-900 md:text-2xl" />
            <span className="hidden text-xs text-primary-900 xs:block md:text-sm">
              Driver Dashboard
            </span>
          </SecondaryButton>
        )}
        <SecondaryButton
          className="border-none bg-transparent px-2 py-2 underline xs:shadow-none"
          onClick={() => navigate({ to: "/app/customer/dashboard" })}
        >
          <HiUser className="text-lg text-primary-900 md:text-2xl" />
          <span className="hidden text-xs text-primary-900 xs:block md:text-sm">
            Customer Dashboard
          </span>
        </SecondaryButton>
        <SecondaryButton
          className="border-none bg-transparent px-2 py-2 underline xs:shadow-none"
          onClick={logOut}
        >
          <IoLogOutOutline className="text-lg text-orange-800 md:text-2xl" />
          <span className="hidden text-xs text-orange-800 xs:block md:text-sm">
            Sign out
          </span>
        </SecondaryButton>
      </div>
    </div>
  );
};

export default AdminHeader;
