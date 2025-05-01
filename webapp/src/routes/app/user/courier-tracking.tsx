import { createFileRoute } from "@tanstack/react-router";
import { DeliveryMap } from "../../../components/molecules/delivery-map";
import { RiderAvatar } from "../../../components/molecules/RiderAvatar";
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

function CourierTrackingScreen() {
  const [isOpen, setIsOpen] = useState(true);
  
  const handleCallCourier = () => {
    // TODO: Implement call functionality
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Success Banner */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-green-700 text-white py-4 px-6 text-center">
        Your courier is on the way!
      </div>

      {/* Map */}
      <div className="h-screen w-full">
        <DeliveryMap
          // center={{ lat: 37.7749, lng: -122.4194 }} // San Francisco coordinates
          // markers={[
          //   { lat: 37.7749, lng: -122.4194 }, // Courier location
          //   { lat: 37.7833, lng: -122.4167 }  // Destination
          // ]}
        />
      </div>

      {/* Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <div className="fixed bottom-8 w-[90%] left-1/2 transform -translate-x-1/2">
            <MobileButton isPrimary={true} text="View Courier Details" onClick={() => setIsOpen(true)} />
          </div>
        </DrawerTrigger>
        <DrawerContent className="bg-mobile-background text-mobile-text border-mobile-text border-2 font-mobile">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 mb-4" />
          <DrawerHeader className="font-mobile">
            <DrawerTitle className="text-[20px] font-mobile">Courier Details</DrawerTitle>
            <DrawerDescription className="m-0 font-mobile">Track your delivery in real-time</DrawerDescription>
          </DrawerHeader>
          
          <div className="px-6 space-y-6 font-mobile">
            <RiderAvatar
              name="Allan Smith"
              deliveryCount={124}
              rating={4.1}
              imageUrl="https://randomuser.me/api/portraits/men/32.jpg"
              timeAway="2 mins"
              showCallButton={true}
              onCallClick={handleCallCourier}
            />

            {/* Cancel Button */}
            <button 
              className="w-full text-red-500 font-medium py-4"
              onClick={() => {
                // TODO: Implement cancel functionality
              }}
            >
              Cancel
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export const Route = createFileRoute("/app/user/courier-tracking")({
  component: CourierTrackingScreen,
}); 