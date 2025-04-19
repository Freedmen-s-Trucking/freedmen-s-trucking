import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  IoCardOutline,
  IoTimeOutline,
  IoSettingsOutline,
  IoHelpCircleOutline,
  IoPeopleOutline,
  IoLogOutOutline,
  IoHomeOutline,
  IoCalendarOutline,
  IoPersonOutline
} from "react-icons/io5";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  link: string;
  textColor?: string;
}

function ProfileScreen() {
  const menuItems: MenuItem[] = [
    {
      icon: <IoCardOutline className="w-6 h-6" />,
      label: "Payments",
      link: "/app/payments"
    },
    {
      icon: <IoTimeOutline className="w-6 h-6" />,
      label: "Delivery History",
      link: "/app/delivery-history"
    },
    {
      icon: <IoSettingsOutline className="w-6 h-6" />,
      label: "Settings",
      link: "/app/settings"
    },
    {
      icon: <IoHelpCircleOutline className="w-6 h-6" />,
      label: "Support/FAQ",
      link: "/app/support"
    },
    {
      icon: <IoPeopleOutline className="w-6 h-6" />,
      label: "Invite Friends",
      link: "/app/invite"
    },
    {
      icon: <IoLogOutOutline className="w-6 h-6" />,
      label: "Sign out",
      link: "/auth/logout",
      textColor: "text-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        {/* Header */}
        <div className="px-4 pt-12 pb-6">
          <h1 className="text-2xl font-medium text-gray-400 mb-8">Account</h1>
          
          {/* Profile Info */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-2xl text-gray-600">DE</span>
            </div>
            <h2 className="text-xl font-medium">Davidson Edgar</h2>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-4 py-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={`flex items-center gap-4 py-4 ${item.textColor || 'text-gray-600'}`}
            >
              {item.icon}
              <span className="text-base">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2">
        <div className="flex justify-around">
          <Link
            to="/"
            className="flex flex-col items-center text-gray-400"
          >
            <IoHomeOutline className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            to="/"
            className="flex flex-col items-center text-gray-400"
          >
            <IoCalendarOutline className="w-6 h-6" />
            <span className="text-xs mt-1">History</span>
          </Link>
          <Link
            to="/"
            className="flex flex-col items-center text-teal-600"
          >
            <IoPersonOutline className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/user/profile")({
  component: ProfileScreen,
}); 