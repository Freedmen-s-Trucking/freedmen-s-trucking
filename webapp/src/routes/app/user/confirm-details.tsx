import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DeliveryMap } from "../../../components/molecules/delivery-map";
import { DeliveryLocationDisplay } from "../../../components/molecules/DeliveryLocationDisplay";
import { useState } from "react";
import { MobileButton } from "../../../components/mobile/mobileButton";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../../components/ui/drawer";

function ConfirmDetailsScreen() {
  const [isOpen, setIsOpen] = useState(true);
  const [pickupLocation] = useState({ lat: 6.4550, lng: 3.3841 }); // Lagos coordinates

  return (
    <div className="flex flex-col min-h-screen font-mobile bg-mobile-background">
      {/* Map Section */}
      <div className="relative h-screen bg-gray-100">
        {/* Back Button */}
        <Link to="/app/user/delivery-details" 
          className="absolute top-12 left-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        
        <DeliveryMap
          center={pickupLocation}
          markers={[
            { lat: 6.4550, lng: 3.3841 },
            { lat: 6.4580, lng: 3.3891 }
          ]}
        />
      </div>

      {/* Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <div className="fixed bottom-8 w-[90%] left-1/2 transform -translate-x-1/2">
            <MobileButton isPrimary={true} text="View Details" onClick={() => setIsOpen(true)} />
          </div>
        </DrawerTrigger>
        <DrawerContent className="bg-mobile-background text-mobile-text border-mobile-text border-2 font-mobile">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 mb-4" />
          <DrawerHeader className="font-mobile">
            <DrawerTitle className="text-[20px] font-mobile">Confirm Details</DrawerTitle>
            <DrawerDescription className="m-0 font-mobile">Review your delivery information</DrawerDescription>
          </DrawerHeader>
          
          <div className="px-6 space-y-6 font-mobile overflow-y-auto h-[1000px]">
            {/* Locations */}
            <div className="mb-6">
              <DeliveryLocationDisplay
                pickupLocation="32 Samwell Sq, Chevron"
                deliveryLocation="21b, Karimu Kotun Street, Victoria Island"
              />
            </div>

            {/* Package Details */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <div className="text-sm text-gray-500">What you are sending</div>
                <div>Electronics/Gadgets</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Recipient</div>
                <div>Donald Duck</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Recipient contact number</div>
                <div>08123456789</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Payment</div>
                <div>Card</div>
              </div>

             
            </div>

            {/* Estimated Fee */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              <div className="text-sm text-gray-500">Estimated fee:</div>
              <div className="text-xl font-semibold">$150</div>
            </div>

            {/* Edit Link */}
           
          </div>

          {/* Fixed Look for courier Button */}
          <div className="flex flex-col gap-4 h-[20vh] w-full justify-center items-center">
          <Link
              to="/app/user/delivery-details"
              className="block text-center text-teal-600"
            >
              Edit Details
            </Link>
          <div className=" bottom-8 w-[90%]">
            <MobileButton 
              isPrimary={true} 
              text="Look for courier"
              onClick={() => {
                // TODO: Implement courier search
              }}
            />
          </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export const Route = createFileRoute("/app/user/confirm-details")({
  component: ConfirmDetailsScreen,
}); 