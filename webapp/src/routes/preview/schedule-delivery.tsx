import { createFileRoute } from "@tanstack/react-router";
import { IoArrowBack } from "react-icons/io5";
import { Link } from "@tanstack/react-router";
import { DeliveryMap } from "../../components/molecules/delivery-map";
import { useState } from "react";
import { MobileButton } from "../../components/mobile/mobileButton";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer"
import { Circle, MapPin } from "lucide-react";
import { Car, Bike, Truck } from 'lucide-react';


// interface DeliveryLocation {
//   address: string;
//   label?: string;
// }

interface Position {
  lat: number;
  lng: number;
}

function InstantDeliveryScreen() {
  const [pickupLocation] = useState<Position>({ lat: 6.4550, lng: 3.3841 }); // Lagos coordinates
  const [deliveryLocation, setDeliveryLocation] = useState<Position | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleMapClick = (position: Position) => {
    if (!deliveryLocation) {
      setDeliveryLocation(position);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-mobile bg-mobile-background ">
      <div>
      
      </div>
      {/* Map Section */}
      <div className="relative h-screen bg-gray-100">
        {/* Back Button */}
        <Link to="/app/user/home" 
          className="absolute top-12 left-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
          <IoArrowBack className="w-6 h-6" />
        </Link>
        
        <DeliveryMap
          center={pickupLocation}
          markers={[pickupLocation, ...(deliveryLocation ? [deliveryLocation] : [])]}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen} >
        <DrawerTrigger asChild>
          <div className="fixed bottom-8 w-[90%] left-1/2 transform -translate-x-1/2 ">
            <MobileButton isPrimary={true} text="Enter Details" onClick={() => setIsOpen(true)} />
          </div>
        </DrawerTrigger>
        <DrawerContent className="bg-mobile-background text-mobile-text border-mobile-text border-2 font-mobile">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 mb-4" />
          <DrawerHeader className="font-mobile">
            <DrawerTitle className="text-[20px] font-mobile">Instant Delivery</DrawerTitle>
            <DrawerDescription className="m-0 font-mobile"> pickup location</DrawerDescription>
          </DrawerHeader>
          
          <div className="px-6 space-y-6 font-mobile">
            {/* Pickup Location */}
            <div>
              <div className="p-4 bg-[#F2E7D8] rounded-2xl flex items-center gap-3 font-mobile">
                <MapPin className="w-5 h-5  stroke-red-600" />
                <input 
                  type="text" 
                  defaultValue="32 Samwell Sq, Chevron" 
                  className="w-full bg-transparent outline-none border-none ring-0 font-mobile focus:outline-none text-mobile-text text-[14px]"
                />
              </div>
            </div>

            {/* Delivery Location */}
            <div>
              <label className="block text-mobile-text mb-2 font-mobile text-[13px]">Delivery Location</label>
              <div className="p-4 bg-[#F2E7D8] rounded-2xl flex items-center gap-3 font-mobile">
                <Circle className="w-5 h-5 stroke-green-600" />
                <input 
                  type="text" 
                  defaultValue="21b, Karimu Kotun Street, Victoria Island" 
                  className="w-full bg-transparent font-mobile focus:outline-none outline-none border-none ring-0 text-mobile-text text-[14px]"
                />
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-mobile-text mb-3 font-mobile text-[13px]">Vehicle Type</label>
              <div className="grid grid-cols-3 gap-4">
                <button className="p-4 bg-stone-500  rounded-xl flex flex-col items-center gap-2 font-mobile">
                  <span className="text-2xl">
                    <Bike className="w-5 h-5 stroke-mobile-text" />
                  </span>
                  <span className="text-sm font-mobile">Bike</span>
                </button>
                <button className="p-4 bg-stone-500 rounded-xl flex flex-col items-center gap-2 font-mobile">
                  <span className="text-2xl">
                    <Car className="w-5 h-5 stroke-mobile-text" />
                  </span>
                  <span className="text-sm font-mobile">Car</span>
                </button>
                <button className="p-4 bg-stone-500 rounded-xl flex flex-col items-center gap-2 font-mobile">
                  <span className="text-2xl">
                    <Truck className="w-6 h-6 stroke-mobile-text" />
                  </span>
                  <span className="text-sm font-mobile">Van</span>
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 mt-6">
            <MobileButton isPrimary={true} text="Next" link="/app/user/instant-delivery" />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export const Route = createFileRoute("/app/user/instant-delivery")({
  component: InstantDeliveryScreen,
}); 