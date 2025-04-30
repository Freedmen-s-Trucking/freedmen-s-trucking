import { Bike } from "lucide-react";

interface OrderCardProps {
  orderId: string;
  recipient: string;
  location: string;
  status: "completed" | "cancelled" | "in progress";
  date?: string;
  rating?: number;
  onClick?: () => void;
}

export const OrderCard = ({ 
  orderId, 
  recipient, 
  location, 
  status, 
  date,
  rating,
  onClick 
}: OrderCardProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case "completed":
        return "bg-green-700 text-white";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = () => {
    if (status === "in progress") return "In progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div 
      className="bg-white p-4 rounded-xl border border-gray-100 space-y-3 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      {/* Order Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold">{orderId}</div>
          <div className="text-gray-500">Recipient: {recipient}</div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Location */}
      <div className="flex items-start gap-2">
        <div className="mt-1">
          <Bike className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-600">{location}</div>
          {date && <div className="text-sm text-gray-400 mt-1">{date}</div>}
        </div>
      </div>

      {/* Rating (only show if completed and rating exists) */}
      {status === "completed" && rating && (
        <div className="flex items-center">
          <svg
            className="w-4 h-4 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}; 