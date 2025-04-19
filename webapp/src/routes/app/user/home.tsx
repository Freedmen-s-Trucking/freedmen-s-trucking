import { createFileRoute } from "@tanstack/react-router";
import { useAppSelector } from "../../../stores/hooks";
import { IoFlash } from "react-icons/io5";
import { IoTimeOutline } from "react-icons/io5";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import { IoTimeSharp } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import { Link } from "@tanstack/react-router";

interface DeliveryHistoryItem {
  orderId: string;
  recipient: string;
  location: string;
  timestamp: string;
  status: 'Completed' | 'Pending' | 'In Progress';
}

function HomeScreen() {
  const user = useAppSelector((state) => state.authCtrl.user);
  
  const deliveryHistory: DeliveryHistoryItem[] = [
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg text-gray-600">Welcome Back</h1>
            <h2 className="text-2xl font-semibold">{user?.info.displayName}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <IoNotificationsOutline className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-800">
              {user?.info.displayName?.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
        <p className="text-gray-600 mb-4">What would you like to do?</p>
      </header>

      {/* Delivery Options */}
      <div className="px-6 space-y-4">
        <Link to="/app/user/instant-delivery" 
          className="block p-6 bg-teal-100 rounded-xl">
          <div className="flex items-center gap-4">
            <IoFlash className="w-8 h-8 text-teal-700" />
            <div>
              <h3 className="text-xl font-semibold mb-1">Instant Delivery</h3>
              <p className="text-gray-600">Courier takes only your package and delivers instantly</p>
            </div>
          </div>
        </Link>

        <Link to="/app/user/schedule-delivery"
          className="block p-6 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <IoTimeOutline className="w-8 h-8 text-teal-700" />
            <div>
              <h3 className="text-xl font-semibold mb-1">Schedule Delivery</h3>
              <p className="text-gray-600">Courier comes to pick up on your specified date and time</p>
            </div>
          </div>
        </Link>
      </div>

      {/* History Section */}
      <div className="px-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">History</h3>
          <Link to="/" className="text-teal-700">View all</Link>
        </div>
        
        <div className="space-y-4">
          {deliveryHistory.map((item, index) => (
            <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{item.orderId}</h4>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {item.status}
                </span>
              </div>
              <p className="text-gray-600 mb-1">Receipient: {item.recipient}</p>
              <div className="flex items-start gap-2">
                <span className="mt-1">📍</span>
                <div>
                  <p className="font-medium">Drop off</p>
                  <p className="text-gray-600">{item.location}</p>
                  <p className="text-gray-500 text-sm">{item.timestamp}</p>
                </div>
              </div>
            </div>
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