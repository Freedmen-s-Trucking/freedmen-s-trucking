import { createFileRoute } from "@tanstack/react-router";
import { IoHomeOutline } from "react-icons/io5";
import { IoTimeSharp } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import { Link } from "@tanstack/react-router";
import { MobileTopBar } from "../../../components/mobile/mobile-top-bar";
import { Zap } from 'lucide-react';
import { Clock } from 'lucide-react';
import { orderCardT } from "../../../types/mobile/order-card-type";
import { OrderCard } from "../../../components/mobile/order-card";



function HomeScreen() {

  
  const deliveryHistory: orderCardT[] = [
    {
      orderId: 'ORDB1234',
      recipient: 'Paul Pogba',
      location: 'Maryland bustop, Anthony Ikeja',
      timestamp: '12 January 2020, 2:43pm',
      status: 'Completed'
    },
    {
      orderId: 'ORDB1234',
      recipient: 'Paul Pogba',
      location: 'Maryland bustop, Anthony Ikeja',
      timestamp: '12 January 2020, 2:43pm',
      status: 'Completed'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-mobile-background text-mobile-text font-mobile">
      {/* Header */}
      <MobileTopBar />
      <p className="text-gray-600 mb-4 px-6  pb-4">What would you like to do?</p>

    

      {/* Delivery Options */}
      <div className="px-6 space-y-4">
      <Link to="/app/user/schedule-delivery"
          className="block p-5 bg-mobile-button rounded-xl border border-mobile-text text-white">
          <div className="flex flex-col justify-start items-start ">
            <Zap className="w-[24px] h-[24px]  stroke-white mb-2" />
            
              <h3 className="text-[16px] font-semibold mb-1">Schedule Delivery</h3>
              <p className="text-white text-[12px]">Courier comes to pick up on your specified date and time</p>
            
          </div>
        </Link>

        <Link to="/app/user/schedule-delivery"
          className="block p-5 bg-mobile-background rounded-xl border border-mobile-text">
          <div className="flex flex-col justify-start items-start ">
            <Clock className="w-[24px] h-[24px]  stroke-mobile-text mb-2" />
            
              <h3 className="text-[16px] font-semibold mb-1">Schedule Delivery</h3>
              <p className="text-mobile-text text-[12px]">Courier comes to pick up on your specified date and time</p>
            
          </div>
        </Link>
      </div>

      {/* History Section */}
      <div className="px-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[14px] font-semibold">History</h3>
          <Link to="/" className="text-mobile-text text-[12px]">View all</Link>
        </div>
        
        <div className="space-y-4">
          {deliveryHistory.map((item) => (
           <OrderCard key={item.orderId} {...item} />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-auto sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-around items-center">
          <Link to="/" className="flex flex-col items-center text-teal-700">
            <IoHomeOutline className="w-6 h-6" />
            <span className="text-sm">Home</span>
          </Link>
          <Link to="/" className="flex flex-col items-center text-gray-400">
            <IoTimeSharp className="w-6 h-6" />
            <span className="text-sm">History</span>
          </Link>
          <Link to="/" className="flex flex-col items-center text-gray-400">
            <IoPersonOutline className="w-6 h-6" />
            <span className="text-sm">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/user/home")({
  component: HomeScreen,
}); 