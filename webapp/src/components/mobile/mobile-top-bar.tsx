// import { IoNotificationsOutline } from "react-icons/io5";
import { useAppSelector } from "../../stores/hooks";
import { Bell } from 'lucide-react';


export const MobileTopBar = () => {
const user = useAppSelector((state) => state.authCtrl.user);

  return (
    <header className="px-6 pt-8 pb-4 text-mobile-text font-mobile bg-mobile-background">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-[12px] text-gray-600">Welcome Back</h1>
        <h2 className="text-[16px] font-semibold">{user?.info.displayName}</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="w-6 h-6 fill-mobile-text" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 
          rounded-full "></span>
        </div>
        <div className="w-[32px] h-[32px] rounded-full bg-mobile-button flex items-center justify-center text-white text-[12px]">
          {user?.info.displayName?.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </div>
  </header>
  );
};