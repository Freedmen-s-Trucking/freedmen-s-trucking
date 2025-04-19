
import { orderCardT } from "../../types/mobile/order-card-type";
export const OrderCard = ( {orderId, recipient, location, timestamp, status}: orderCardT) => {
  return (
    <div key={orderId} className="p-4 bg-white rounded-lg border border-gray-200">
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-medium">{orderId}</h4>
      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
        {status}
      </span>
    </div>
    <p className="text-gray-600 mb-1">Receipient: {recipient}</p>
    <div className="flex items-start gap-2">
      <span className="mt-1">📍</span>
      <div>
        <p className="font-medium">Drop off</p>
        <p className="text-gray-600">{location}</p>
        <p className="text-gray-500 text-sm">{timestamp}</p>
      </div>
    </div>
  </div>
  );
};