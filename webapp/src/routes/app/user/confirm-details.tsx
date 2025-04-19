import { createFileRoute } from "@tanstack/react-router";
import { IoArrowBack } from "react-icons/io5";
import { Link } from "@tanstack/react-router";
import { DeliveryMap } from "../../../components/molecules/delivery-map";

function ConfirmDetailsScreen() {
  // const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 pt-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/app/user/delivery-details" 
            className="w-10 h-10 flex items-center justify-center">
            <IoArrowBack className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-semibold">Confirm Details</h1>
        </div>
      </div>

      {/* Map */}
      <div className="h-[35vh] bg-gray-100 mb-4">
        <DeliveryMap
          center={{ lat: 6.4550, lng: 3.3841 }}
          markers={[
            { lat: 6.4550, lng: 3.3841 },
            { lat: 6.4580, lng: 3.3891 }
          ]}
        />
      </div>

      {/* Details Card */}
      <div className="mx-4 bg-white rounded-xl shadow-lg -mt-8">
        <div className="p-6">
          {/* Locations */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-3">
              <span className="text-red-500">📍</span>
              <div>
                <div className="text-sm text-gray-500">Pickup Location</div>
                <div>32 Samwell Sq, Chevron</div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-green-500">📍</span>
              <div>
                <div className="text-sm text-gray-500">Delivery Location</div>
                <div>21b, Karimu Kotun Street, Victoria Island</div>
              </div>
            </div>
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
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
            <div className="text-sm text-gray-500">Estimated fee:</div>
            <div className="text-xl font-semibold">$150</div>
          </div>

          {/* Edit Link */}
          <Link
            to="/app/user/delivery-details"
            className="block text-center text-teal-600 mt-4"
          >
            Edit Details
          </Link>
        </div>
      </div>

      {/* Look for courier Button */}
      <div className="px-6 mt-6">
        <button 
          className="w-full bg-teal-700 text-white py-4 rounded-xl font-medium"
          onClick={() => {
            // TODO: Implement courier search
          }}
        >
          Look for courier
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/user/confirm-details")({
  component: ConfirmDetailsScreen,
}); 