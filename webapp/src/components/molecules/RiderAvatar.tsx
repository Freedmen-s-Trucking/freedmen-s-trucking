import { Star } from "lucide-react";
import { IoCall } from "react-icons/io5";

interface RiderAvatarProps {
  name: string;
  deliveryCount: number;
  rating: number;
  imageUrl: string;
  timeAway?: string;
  showCallButton?: boolean;
  onCallClick?: () => void;
}

export const RiderAvatar = ({
  name,
  deliveryCount,
  rating,
  imageUrl,
  timeAway,
  showCallButton = false,
  onCallClick,
}: RiderAvatarProps) => {
  // Generate array of stars based on rating
  const stars = Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`h-4 w-4 ${index < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
    />
  ));

  return (
    <div className="flex flex-col">
      {/* Status and Time */}
      {timeAway && (
        <div className="mb-6 flex items-center justify-between">
          <div className="text-green-700">Your courier is on his way!</div>
          <div className="text-sm">{timeAway} away</div>
        </div>
      )}

      {/* Courier Info */}
      <div className="flex items-center gap-4">
        <img
          src={imageUrl}
          alt={name}
          className="h-16 w-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="text-lg font-semibold">{name}</div>
          <div className="text-sm text-gray-500">
            {deliveryCount} Deliveries
          </div>
          <div className="mt-1 flex items-center gap-1">
            <div className="flex">{stars}</div>
            <span className="text-sm text-gray-500">{rating.toFixed(1)}</span>
          </div>
        </div>
        {showCallButton && (
          <button
            className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
            onClick={onCallClick}
          >
            <IoCall className="h-6 w-6 text-green-700" />
          </button>
        )}
      </div>
    </div>
  );
};
