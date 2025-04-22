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
  onCallClick
}: RiderAvatarProps) => {
  // Generate array of stars based on rating
  const stars = Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`w-4 h-4 ${index < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
    />
  ));

  return (
    <div className="flex flex-col">
      {/* Status and Time */}
      {timeAway && (
        <div className="flex justify-between items-center mb-6">
          <div className="text-green-700">Your courier is on his way!</div>
          <div className="text-sm">{timeAway} away</div>
        </div>
      )}

      {/* Courier Info */}
      <div className="flex items-center gap-4">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="font-semibold text-lg">{name}</div>
          <div className="text-gray-500 text-sm">{deliveryCount} Deliveries</div>
          <div className="flex items-center mt-1 gap-1">
            <div className="flex">{stars}</div>
            <span className="text-sm text-gray-500">{rating.toFixed(1)}</span>
          </div>
        </div>
        {showCallButton && (
          <button 
            className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
            onClick={onCallClick}
          >
            <IoCall className="w-6 h-6 text-green-700" />
          </button>
        )}
      </div>
    </div>
  );
}; 