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
  IoPerson,
  IoChevronForward,
  IoPersonCircle
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
      icon: <IoWalletOutline className="w-6 h-6 text-mobile-text" />,
      label: "Payments",
      route: "/app/agents/payments"
    },
    {
      icon: <IoDocumentTextOutline className="w-6 h-6 text-mobile-text" />,
      label: "Documents",
      route: "/app/agents/documents"
    },
    {
      icon: <IoCarOutline className="w-6 h-6 text-mobile-text" />,
      label: "Vehicle",
      route: "/app/agents/vehicle"
    },
    {
      icon: <IoTimeOutline className="w-6 h-6 text-mobile-text" />,
      label: "Delivery History",
      route: "/app/agents/delivery-history"
    },
    {
      icon: <IoSettingsOutline className="w-6 h-6 text-mobile-text" />,
      label: "Settings",
      route: "/app/agents/settings"
    },
    {
      icon: <IoHelpCircleOutline className="w-6 h-6 text-mobile-text" />,
      label: "Support/FAQ",
      route: "/app/agents/support"
    },
    {
      icon: <IoShareSocialOutline className="w-6 h-6 text-mobile-text" />,
      label: "Invite Friends",
      route: "/app/agents/invite"
    }
  ];

  return (
    <div className="min-h-screen bg-mobile-background font-mobile">
      {/* Profile Section */}
      <div className="flex flex-col items-center pt-8 pb-6">
        <div className="w-20 h-20 rounded-full bg-mobile-background border border-mobile-text flex items-center justify-center mb-3 overflow-hidden">
          <img
            src="/this"
            alt="Allan Smith"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <IoPersonCircle className="w-full h-full text-mobile-text hidden" />
        </div>
        <h1 className="text-xl font-medium text-mobile-text">Allan Smith</h1>
      </div>

      {/* Menu Items */}
      <div className="px-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate({ to: item.route })}
            className="w-full flex items-center justify-between py-4 border-b border-gray-200"
          >
            <div className="flex items-center gap-4">
              {item.icon}
              <span className="text-mobile-text">{item.label}</span>
            </div>
            <IoChevronForward className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-mobile-background border-t border-gray-200 py-2">
        <div className="flex justify-around items-center">
          <button className="flex flex-col items-center gap-1 px-4 text-gray-400">
            <IoHome className="w-6 h-6" />
            <span className="text-xs font-mobile">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 text-gray-400">
            <IoWallet className="w-6 h-6" />
            <span className="text-xs font-mobile">Earnings</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 text-gray-400">
            <IoCalendar className="w-6 h-6" />
            <span className="text-xs font-mobile">Bookings</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 text-mobile-text">
            <IoPerson className="w-6 h-6" />
            <span className="text-xs font-mobile">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/profile")({
  component: ProfileScreen,
}); 