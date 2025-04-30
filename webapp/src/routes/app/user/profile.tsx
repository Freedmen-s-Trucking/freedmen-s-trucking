import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { MobileBottomBar } from "../../../components/mobile/mobile-bottom-bar";
import {
  CreditCard,
  Clock,
  Settings,
  HelpCircle,
  Users,
  LogOut,
} from "lucide-react";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  link: string;
  textColor?: string;
}

function ProfileScreen() {
  const menuItems: MenuItem[] = [
    {
      icon: <CreditCard className="w-6 h-6 stroke-mobile-text" />,
      label: "Payments",
      link: "/app/payments"
    },
    {
      icon: <Clock className="w-6 h-6 stroke-mobile-text" />,
      label: "Delivery History",
      link: "/app/delivery-history"
    },
    {
      icon: <Settings className="w-6 h-6 stroke-mobile-text" />,
      label: "Settings",
      link: "/app/settings"
    },
    {
      icon: <HelpCircle className="w-6 h-6 stroke-mobile-text" />,
      label: "Support/FAQ",
      link: "/app/support"
    },
    {
      icon: <Users className="w-6 h-6 stroke-mobile-text" />,
      label: "Invite Friends",
      link: "/app/invite"
    },
    {
      icon: <LogOut className="w-6 h-6 stroke-red-500" />,
      label: "Sign out",
      link: "/auth/logout", textColor: "text-red-500" }
  ];

  return (
    <div className="min-h-screen bg-mobile-background font-mobile flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-[20px] font-mobile text-mobile-text mb-8">Account</h1>
        
        {/* Profile Info */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-[#F4F9F8] flex items-center justify-center mb-4">
            <span className="text-2xl text-teal-700">DE</span>
          </div>
          <h2 className="text-xl font-medium text-mobile-text">Davidson Edgar</h2>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 py-6 flex-1">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            className={`flex items-center gap-4 py-4 ${item.textColor || 'text-mobile-text'}`}
          >
            {item.icon}
            <span className="text-[14px]">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Bottom Navigation */}
      <MobileBottomBar isAgent={false} />
    </div>
  );
}

export const Route = createFileRoute("/app/user/profile")({
  component: ProfileScreen,
}); 