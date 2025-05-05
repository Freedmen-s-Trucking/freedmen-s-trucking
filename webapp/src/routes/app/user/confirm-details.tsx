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
  // const [pickupLocation] = useState({ lat: 6.4550, lng: 3.3841 }); // Lagos coordinates

  return (
    <div className="flex min-h-screen flex-col bg-mobile-background font-mobile">
      {/* Map Section */}
      <div className="relative h-screen bg-gray-100">
        {/* Back Button */}
        <Link
          to="/app/user/delivery-details"
          className="absolute left-4 top-12 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>

        <DeliveryMap
        // center={pickupLocation}
        // markers={[
        //   { lat: 6.4550, lng: 3.3841 },
        //   { lat: 6.4580, lng: 3.3891 }
        // ]}
        />
      </div>

      {/* Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <div className="fixed bottom-8 left-1/2 w-[90%] -translate-x-1/2 transform">
            <MobileButton
              isPrimary={true}
              text="View Details"
              onClick={() => setIsOpen(true)}
            />
          </div>
        </DrawerTrigger>
        <DrawerContent className="border-2 border-mobile-text bg-mobile-background font-mobile text-mobile-text">
          <div className="mx-auto mb-4 mt-2 h-1.5 w-12 rounded-full bg-gray-300" />
          <DrawerHeader className="font-mobile">
            <DrawerTitle className="font-mobile text-[20px]">
              Confirm Details
            </DrawerTitle>
            <DrawerDescription className="m-0 font-mobile">
              Review your delivery information
            </DrawerDescription>
          </DrawerHeader>

          <div className="h-[1000px] space-y-6 overflow-y-auto px-6 font-mobile">
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
                <div className="text-sm text-gray-500">
                  What you are sending
                </div>
                <div>Electronics/Gadgets</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Recipient</div>
                <div>Donald Duck</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  Recipient contact number
                </div>
                <div>08123456789</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Payment</div>
                <div>Card</div>
              </div>
            </div>

            {/* Estimated Fee */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
              <div className="text-sm text-gray-500">Estimated fee:</div>
              <div className="text-xl font-semibold">$150</div>
            </div>

            {/* Edit Link */}
          </div>

          {/* Fixed Look for courier Button */}
          <div className="flex h-[20vh] w-full flex-col items-center justify-center gap-4">
            <Link
              to="/app/user/delivery-details"
              className="block text-center text-teal-600"
            >
              Edit Details
            </Link>
            <div className=" bottom-8 w-[90%]">
              <MobileButton
                link="/app/user/delivery-in-progress"
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
