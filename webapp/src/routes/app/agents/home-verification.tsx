import { createFileRoute } from "@tanstack/react-router";
import { IoHomeOutline, IoCalendarOutline, IoPersonOutline } from "react-icons/io5";

function HomeVerificationScreen() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500">Welcome Back</div>
            <div className="text-lg font-medium">Allan Smith</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm">DE</span>
            </div>
          </div>
        </div>

        {/* Identity Verification */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Identity Verification</h3>
              <p className="text-sm text-gray-500">Please verify your identity to start accepting deliveries</p>
            </div>
          </div>
        </div>

        {/* Add Vehicle */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Add Vehicle</h3>
              <p className="text-sm text-gray-500">Add your vehicle registration documents</p>
            </div>
          </div>
        </div>

        {/* Available Requests */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium">Available Requests</h2>
            <button className="text-sm text-teal-600">View all</button>
          </div>
          <div className="bg-white rounded-xl p-4 flex items-center justify-center h-32">
            <div className="text-center text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
              <p className="text-sm">Complete Onboarding to start seeing requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center text-teal-600">
            <IoHomeOutline className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <IoCalendarOutline className="w-6 h-6" />
            <span className="text-xs mt-1">History</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <IoPersonOutline className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/home-verification")({
  component: HomeVerificationScreen,
}); 