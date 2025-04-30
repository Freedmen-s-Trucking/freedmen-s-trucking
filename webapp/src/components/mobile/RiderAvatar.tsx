import { Star } from "lucide-react";

interface RiderAvatarProps {
  name: string;
  deliveryCount: number;
  rating: number;
  imageUrl: string;
}

export const RiderAvatar = ({ name, deliveryCount, rating, imageUrl }: RiderAvatarProps) => {
  // Generate array of stars based on rating
  const stars = Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`w-4 h-4 ${index < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
    />
  ));

  return (
    <div className="flex items-center gap-3">
      {/* Rider Image */}
      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Rider Info */}
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{deliveryCount} Deliveries</span>
        </div>
        {/* Rating Stars */}
        <div className="flex items-center gap-1">
          <div className="flex">{stars}</div>
          <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}; 