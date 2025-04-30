import { IoHomeOutline } from "react-icons/io5";
import { Wallet } from 'lucide-react';
import { IoPersonOutline } from "react-icons/io5";
import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

export const MobileBottomBar = ({isAgent}: {isAgent: boolean}) => {
    if (isAgent) {
      return (
        <div className="mt-auto sticky bottom-0 border-t border-mobile-text p-4 bg-mobile-background">
          <div className="flex justify-around items-center">
            <Link to="/app/agents/home" className="flex flex-col items-center text-mobile-text stroke-mobile-text">
              <IoHomeOutline className="w-6 h-6" />
              <span className="text-sm">Home</span>
            </Link>

            <Link to="/app/agents/home" className="flex flex-col items-center text-mobile-text stroke-mobile-text">
              <Clock className="w-6 h-6" />
              <span className="text-sm">History</span>
            </Link>

            <Link to="/app/agents/earnings" className="flex flex-col items-center text-mobile-text stroke-mobile-text">
              <Wallet className="w-6 h-6" />
              <span className="text-sm">Earnings</span>
            </Link>

            <Link to="/app/agents/profile" className="flex flex-col items-center text-mobile-text stroke-mobile-text">
              <IoPersonOutline className="w-6 h-6" />
              <span className="text-sm">Profile</span>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-auto sticky bottom-0 border-t border-mobile-text p-4 bg-mobile-background">
        <div className="flex justify-around items-center">
          <Link to="/app/user/home" className="flex flex-col items-center text-mobile-text stroke-mobile-text">
            <IoHomeOutline className="w-6 h-6" />
            <span className="text-sm">Home</span>
          </Link>

          <Link to="/app/user/delivery-history" className="flex flex-col items-center text-mobile-text stroke-mobile-text">
            <Clock className="w-6 h-6" />
            <span className="text-sm">History</span>
          </Link>

          <Link to="/app/user/profile" className="flex flex-col items-center text-mobile-text stroke-mobile-text">
            <IoPersonOutline className="w-6 h-6" />
            <span className="text-sm">Profile</span>
          </Link>
        </div>
      </div>
    );
}