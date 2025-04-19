import { createFileRoute } from "@tanstack/react-router";
import {  IoCall } from "react-icons/io5";
// import { Link } from "@tanstack/react-router";
import { DeliveryMap } from "../../../components/molecules/delivery-map";

function CourierTrackingScreen() {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Success Banner */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-green-700 text-white py-4 px-6 text-center">
        Your courier is on the way!
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

      {/* Courier Details Card */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg">
        <div className="p-6">
          {/* Status */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-green-700">Your courier is on his way!</div>
            <div className="text-sm">2 mins away</div>
          </div>

          {/* Courier Info */}
          <div className="flex items-center gap-4">
            <img 
              src="https://randomuser.me/api/portraits/men/32.jpg" 
              alt="Allan Smith"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-semibold text-lg">Allan Smith</div>
              <div className="text-gray-500 text-sm">124 Deliveries</div>
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4].map((star) => (
                  <svg
                    key={star}
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <svg
                  className="w-4 h-4 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 text-sm text-gray-500">4.1</span>
              </div>
            </div>
            <button 
              className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
              onClick={() => {
                // TODO: Implement call functionality
              }}
            >
              <IoCall className="w-6 h-6 text-green-700" />
            </button>
          </div>

          {/* Cancel Button */}
          <button 
            className="w-full text-red-500 font-medium mt-6"
            onClick={() => {
              // TODO: Implement cancel functionality
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/user/courier-tracking")({
  component: CourierTrackingScreen,
}); 