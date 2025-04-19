
import { orderCardT } from "../../types/mobile/order-card-type";
import { MapPin } from 'lucide-react';
import { Bike } from 'lucide-react';


export const OrderCard = ( {orderId, recipient, location, timestamp, status , expectedTime}: orderCardT) => {
  return (
    <div key={orderId} className="p-4   bg-mobile-background text-mobile-text rounded-lg ">
    <div className="flex justify-between items-start ">
      <h4 className="font-medium text-[14px]">{orderId}</h4>
      {status === "Completed" && (
        <span className="px-3 py-1 bg-green-800 text-white rounded-mobile text-[10px]">
          {status}
        </span>
      )}
      {status === "Pending" && (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
          {status}
        </span>
      )}
      
      
    </div>
    <p className="text-mobile-text text-[12px] mb-[11px]">Receipient: {recipient}</p>
    <div className="flex items-start gap-2">
        <Bike className="w-[24px] h-[17px] stroke-mobile-text " />
      <div>
        <div className="flex items-center gap-1">
        <MapPin className="w-[12px] h-[12px] stroke-mobile-text " />
        <p className="font-medium text-[10px]">Drop off</p>
        </div>
        <p className="text-gray-600 text-[12px]">{location}</p>

{status === "Completed" && (
    <p className="text-gray-600 text-[12px]">
        {timestamp}
    </p>
)}
{status === "Pending" && (
    <div className="flex items-center gap-1">
      
        <span className="text-gray-600 text-[12px]">
            <span className="text-green-500">{expectedTime}</span> to delivery location 
        </span>
    </div>
)}

      </div>
    </div>
  </div>
  );
};