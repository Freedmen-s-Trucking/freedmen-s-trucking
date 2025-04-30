import { createFileRoute } from "@tanstack/react-router";
import { IoCall } from "react-icons/io5";
import { DeliveryMap } from "../../../components/molecules/delivery-map";
import { useNavigate } from "@tanstack/react-router";

function DeliveryInProgressScreen() {
  const navigate = useNavigate();

  const handleRatingClick = () => {
    navigate({ to: '/app/user/delivery-review' });
  };

  return (
    <div className="min-h-screen bg-mobile-background font-mobile relative">
      {/* Success Banner */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-stone-500 text-mobile-text py-4 px-6 text-center font-mobile">
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

      {/* Time to Delivery */}
      <div className="absolute top-20 left-0 right-0 z-10 mx-4">
        <div className="p-4 bg-[#F2E7D8] rounded-2xl text-mobile-text font-mobile shadow-lg">
          <div className="text-lg font-medium">5 minutes to delivery</div>
        </div>
      </div>

      {/* Courier Details Card */}
      <div className="absolute bottom-0 left-0 right-0 bg-mobile-background rounded-t-3xl shadow-lg">
        <div className="p-6">
          {/* Courier Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#F2E7D8] rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src="https://randomuser.me/api/portraits/men/32.jpg" 
                alt="Allan Smith"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg text-mobile-text">Allan Smith</div>
              <div className="text-mobile-text opacity-80 text-sm">124 Deliveries</div>
              <div className="flex items-center mt-1 cursor-pointer" onClick={handleRatingClick}>
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
                <span className="ml-1 text-sm text-mobile-text opacity-80">4.1</span>
              </div>
            </div>
            <button 
              className="w-12 h-12 bg-stone-500 rounded-full flex items-center justify-center"
              onClick={() => {
                // TODO: Implement call functionality
              }}
            >
              <IoCall className="w-6 h-6 text-mobile-text" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/user/delivery-in-progress")({
  component: DeliveryInProgressScreen,
}); 