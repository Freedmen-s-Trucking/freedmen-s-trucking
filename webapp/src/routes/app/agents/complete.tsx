import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack } from "react-icons/io5";

function CompleteScreen() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b">
        <button
          onClick={() => window.history.back()}
          className="text-gray-700"
        >
          <IoChevronBack className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium">Drop off process</h1>
      </div>

      <div className="p-4">
        {/* Map Preview */}
        <div className="h-64 bg-gray-100 rounded-xl mb-6"></div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-600">Your package has been successfully delivered and payment will be credited to your wallet.</p>
        </div>

        {/* Payment Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">Amount</span>
            <span className="font-medium">$200</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Payment Method</span>
            <span className="font-medium">Card</span>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full px-4 py-3 text-white bg-teal-600 rounded-xl">
          Done
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/complete")({
  component: CompleteScreen,
}); 