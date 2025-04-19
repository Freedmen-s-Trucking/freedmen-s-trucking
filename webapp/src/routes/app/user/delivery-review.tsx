import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DeliveryMap } from "../../../components/molecules/delivery-map";

function DeliveryReviewScreen() {
  const [rating, setRating] = useState(0);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Success Banner */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-green-700 text-white py-4 px-6 text-center">
        Delivery in progress
      </div>

      {/* Map */}
      <div className="h-[60vh] w-full">
        <DeliveryMap
          center={{ lat: 37.7749, lng: -122.4194 }} // San Francisco coordinates
          markers={[
            { lat: 37.7749, lng: -122.4194 }, // Courier location
            { lat: 37.7833, lng: -122.4167 }  // Destination
          ]}
        />
      </div>

      {/* Review Card */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Leave a review about this Courier</h2>
          
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
          <button 
            className="w-full bg-teal-700 text-white py-4 rounded-xl font-medium"
            onClick={() => {
              // TODO: Implement review submission
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/user/delivery-review")({
  component: DeliveryReviewScreen,
}); 