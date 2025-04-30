import React from 'react';
import { Bike } from 'lucide-react';

interface RequestCardProps {
  itemType: string;
  recipient: string;
  location: string;
  onAccept: () => void;
  onReject: () => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  itemType,
  recipient,
  location,
  onAccept,
  onReject
}) => {
  return (
    <div className="bg-[#F2E7D8] rounded-2xl p-4 space-y-4 font-mobile text-mobile-text">
      {/* Item and Recipient Info */}
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{itemType}</h3>
        <p className="text-sm">Receipient: {recipient}</p>
      </div>

      {/* Location */}
      <div className="flex items-start gap-2">
        <div className="flex items-center gap-2 mt-1">
          <Bike className="w-5 h-5" />
          <span className="text-sm">Drop off</span>
        </div>
        <p className="text-sm flex-1">{location}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-2">
        <button
          onClick={onReject}
          className="flex-1 py-3 px-6 rounded-2xl font-medium bg-[#F2E7D8] text-mobile-text border border-mobile-text"
        >
          Reject
        </button>
        <button
          onClick={onAccept}
          className="flex-1 py-3 px-6 rounded-2xl font-medium bg-stone-500 text-mobile-text"
        >
          Accept
        </button>
      </div>
    </div>
  );
}; 