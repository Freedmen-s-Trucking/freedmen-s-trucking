import { createFileRoute } from "@tanstack/react-router";
import { MobileTopBar } from "../../../components/mobile/mobile-top-bar";
import { MobileBottomBar } from "../../../components/mobile/mobile-bottom-bar";
import { AlertTriangle, Users2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function HomeScreen() {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  return (
    <div className="min-h-screen bg-mobile-background font-mobile flex flex-col">
      <MobileTopBar />

      <div className="px-6 flex-1">
        {/* Todo Section */}
        <h2 className="text-[16px] font-medium text-mobile-text mb-4">Todo</h2>
        
        {/* Identity Verification Card */}
        <div className="bg-mobile-background border border-mobile-text rounded-xl p-4 mb-3">
          <div className="flex justify-between">
            <div>
              <h3 className="text-[16px] font-medium text-mobile-text mb-1">Identity Verification</h3>
              <p className="text-[14px] text-gray-600">
                Add your driving license, or any other means of driving identification used in your country
              </p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          </div>
        </div>

        {/* Add Vehicle Card */}
        <div className="bg-mobile-background border border-mobile-text rounded-xl p-4 mb-6">
          <div className="flex justify-between">
            <div>
              <h3 className="text-[16px] font-medium text-mobile-text mb-1">Add Vehicle</h3>
              <p className="text-[14px] text-gray-600">
                Upload insurance and registration documents of the vehicle you intend to use.
              </p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-mobile-text text-white border border-mobile-text rounded-xl p-4 mb-6">
          <h3 className="text-[14px] text-white mb-1">Available balance</h3>
          <div className="flex items-center gap-2">
            {isBalanceVisible ? (
              <span className="text-[32px] font-semibold text-white">$0</span>
            ) : (
              <span className="text-[32px] font-semibold text-white">••••</span>
            )}
            <button 
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="text-white flex-shrink-0"
            >
              {isBalanceVisible ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Direction Specification */}
        <div className="mb-6">
          <h3 className="text-[16px] text-mobile-text mb-3">Would you like to specify direction for deliveries?</h3>
          <div className="bg-mobile-background border border-mobile-text rounded-xl p-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-mobile-text"></div>
            <input 
              type="text" 
              placeholder="Where to?"
              className="bg-transparent text-[14px] text-mobile-text outline-none border-none flex-1"
            />
          </div>
        </div>

        {/* Available Requests */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[16px] font-medium text-mobile-text">Available Requests</h2>
            <button className="text-[14px] text-mobile-text">View all</button>
          </div>

          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 bg-mobile-background border border-mobile-text rounded-full flex items-center justify-center mb-4">
              <Users2 className="w-6 h-6 text-mobile-text" />
            </div>
            <p className="text-[14px] text-mobile-text text-center">
              Complete Onboarding to start taking requests
            </p>
          </div>
        </div>
      </div>

      <MobileBottomBar isAgent={true} />
    </div>
  );
}

export const Route = createFileRoute("/app/agents/home")({
  component: HomeScreen,
}); 