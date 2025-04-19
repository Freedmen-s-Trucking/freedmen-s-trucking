import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DeliveryMap } from "../../../components/molecules/delivery-map";
import { MobileButton } from "../../../components/mobile/mobileButton";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../../components/ui/drawer";

function DeliveryReviewScreen() {
  const [rating, setRating] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  const handleSubmitReview = () => {
    // TODO: Implement review submission
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Success Banner */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-green-700 text-white py-4 px-6 text-center">
        Delivery in progress
      </div>

      {/* Map */}
      <div className="h-screen w-full">
        <DeliveryMap
          center={{ lat: 37.7749, lng: -122.4194 }} // San Francisco coordinates
          markers={[
            { lat: 37.7749, lng: -122.4194 }, // Courier location
            { lat: 37.7833, lng: -122.4167 }  // Destination
          ]}
        />
      </div>

      {/* Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <div className="fixed bottom-8 w-[90%] left-1/2 transform -translate-x-1/2">
            <MobileButton isPrimary={true} text="Rate Your Delivery" onClick={() => setIsOpen(true)} />
          </div>
        </DrawerTrigger>
        <DrawerContent className="bg-mobile-background text-mobile-text border-mobile-text border-2 font-mobile">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 mb-4" />
          <DrawerHeader className="font-mobile">
            <DrawerTitle className="text-[20px] font-mobile">Rate Your Experience</DrawerTitle>
            <DrawerDescription className="m-0 font-mobile">Leave a review about this courier</DrawerDescription>
          </DrawerHeader>
          
          <div className="px-6 space-y-6 font-mobile">
            {/* Rating */}
            <div className="mb-8">
              <div className="text-gray-600 mb-3">Rating</div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <MobileButton 
              isPrimary={true}
              text="Done"
              onClick={handleSubmitReview}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export const Route = createFileRoute("/app/user/delivery-review")({
  component: DeliveryReviewScreen,
}); 