import React, { useState } from "react";
import { Avatar, Button, Dropdown } from "flowbite-react";
import { useAuth } from "~/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { HiEye, HiEyeOff, HiLogout } from "react-icons/hi";
import { CiMenuKebab } from "react-icons/ci";
import { TbLayoutDashboard } from "react-icons/tb";

const AdminHeader: React.FC = () => {
  const [showAdminId, setShowAdminId] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const logOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="my-6 flex w-full max-w-3xl flex-col rounded-lg bg-white p-4 shadow sm:flex-row">
      <div className="relative mb-4 md:mb-0 md:mr-6">
        <Avatar
          placeholderInitials={user.info.displayName}
          img={user.info.photoURL || ""}
          rounded
          size="lg"
        />
      </div>
      <div className="text-center md:text-left">
        <h1 className="text-2xl font-bold">{user.info.displayName}</h1>
        <p className="text-gray-600">{user.info.email}</p>
        <div className="mt-1 flex items-center justify-center text-center">
          <span className="mr-2">Admin ID:</span>
          {showAdminId ? (
            <span className="font-mono">{user.info.uid}</span>
          ) : (
            <span className="font-mono">
              {user.info.uid.slice(0, 4)}-****-****
            </span>
          )}
          <Button
            color="light"
            size="xs"
            className="ml-2"
            onClick={() => setShowAdminId(!showAdminId)}
          >
            {showAdminId ? (
              <HiEyeOff className="h-4 w-4" />
            ) : (
              <HiEye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-end sm:flex-row">
        <Dropdown
          trigger="hover"
          renderTrigger={() => (
            <span className="inline-block items-center rounded-3xl border border-gray-300 bg-white p-2 text-sm font-medium text-secondary-950 hover:border-primary-700 hover:text-primary-700 focus:border-primary-700 focus:text-primary-700 disabled:pointer-events-none disabled:opacity-50">
              <CiMenuKebab className="h-8 w-8" />
            </span>
          )}
          label=""
        >
          {user.driverInfo && (
            <Dropdown.Item
              icon={TbLayoutDashboard}
              onClick={() => navigate({ to: "/app/driver/dashboard" })}
            >
              Driver Dashboard
            </Dropdown.Item>
          )}
          <Dropdown.Item
            icon={TbLayoutDashboard}
            onClick={() => navigate({ to: "/app/customer/dashboard" })}
          >
            Customer Dashboard
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item icon={HiLogout} onClick={logOut}>
            Sign out
          </Dropdown.Item>
        </Dropdown>
      </div>
    </div>
  );
};

export default AdminHeader;
