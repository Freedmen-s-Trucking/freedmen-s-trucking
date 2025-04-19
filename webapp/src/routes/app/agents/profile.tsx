import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import React from 'react';
import {
  IoWalletOutline,
  IoDocumentTextOutline,
  IoCarOutline,
  IoTimeOutline,
  IoSettingsOutline,
  IoHelpCircleOutline,
  IoShareSocialOutline,
  IoHome,
  IoWallet,
  IoCalendar,
  IoPerson
} from "react-icons/io5";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  route: string;
}

function ProfileScreen() {
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    {
      icon: <IoWalletOutline className="w-6 h-6 text-gray-500" />,
      label: "Payments",
      route: "/app/agents/payments"
    },
    {
      icon: <IoDocumentTextOutline className="w-6 h-6 text-gray-500" />,
      label: "Documents",
      route: "/app/agents/documents"
    },
    {
      icon: <IoCarOutline className="w-6 h-6 text-gray-500" />,
      label: "Vehicle",
      route: "/app/agents/vehicle"
    },
    {
      icon: <IoTimeOutline className="w-6 h-6 text-gray-500" />,
      label: "Delivery History",
      route: "/app/agents/delivery-history"
    },
    {
      icon: <IoSettingsOutline className="w-6 h-6 text-gray-500" />,
      label: "Settings",
      route: "/app/agents/settings"
    },
    {
      icon: <IoHelpCircleOutline className="w-6 h-6 text-gray-500" />,
      label: "Support/FAQ",
      route: "/app/agents/support"
    },
    {
      icon: <IoShareSocialOutline className="w-6 h-6 text-gray-500" />,
      label: "Invite Friends",
      route: "/app/agents/invite"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Profile Section */}
      <div className="flex flex-col items-center pt-8 pb-6">
        <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mb-3">
          <span className="text-2xl font-medium text-teal-800">AS</span>
        </div>
        <h1 className="text-xl font-medium text-gray-900">Allan Smith</h1>
      </div>

      {/* Menu Items */}
      <div className="px-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate({ to: item.route })}
            className="w-full flex items-center gap-4 py-4 border-b border-gray-100"
          >
            {item.icon}
            <span className="text-gray-600">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2">
        <div className="flex justify-around items-center">
          <button className="flex flex-col items-center gap-1 px-4 text-gray-400">
            <IoHome className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 text-gray-400">
            <IoWallet className="w-6 h-6" />
            <span className="text-xs">Earnings</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 text-gray-400">
            <IoCalendar className="w-6 h-6" />
            <span className="text-xs">Bookings</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 text-teal-600">
            <IoPerson className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/profile")({
  component: ProfileScreen,
}); 