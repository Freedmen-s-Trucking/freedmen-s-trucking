import { Star } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface RiderAvatarProps {
  name: string;
  deliveryCount: number;
  rating: number;
  imageUrl: string;
}

export const RiderAvatar = ({
  name,
  deliveryCount,
  rating,
  imageUrl,
}: RiderAvatarProps) => {
  // Generate array of stars based on rating
  const stars = Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={twMerge(
        "h-4 w-4",
        index < Math.floor(rating)
          ? "fill-yellow-400 text-yellow-400"
          : "text-gray-200",
      )}
    />
  ));

  return (
    <div className="flex items-center gap-3">
      {/* Rider Image */}
      <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-gray-100">
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      </div>

      {/* Rider Info */}
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {deliveryCount} Deliveries
          </span>
        </div>
        {/* Rating Stars */}
        <div className="flex items-center gap-1">
          <div className="flex">{stars}</div>
          <span className="text-sm font-medium text-gray-700">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};
