import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { IoChevronBack } from "react-icons/io5";
import { useState } from "react";
import { BsBackpack } from "react-icons/bs";
import { IoCarOutline, IoBicycle } from "react-icons/io5";
import { FaTruck } from "react-icons/fa";

type Vehicle = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

function RegisterScreen() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const vehicles: Vehicle[] = [
    { id: 'backpack', icon: BsBackpack, label: 'BackPack' },
    { id: 'bike', icon: IoBicycle, label: 'Bike' },
    { id: 'car', icon: IoCarOutline, label: 'Car' },
    { id: 'truck', icon: FaTruck, label: 'Truck' }
  ];

  return (
    <div className="min-h-screen bg-mobile-background font-mobile">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <Link
          to="/app/agents/welcome"
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <IoChevronBack className="w-6 h-6" />
        </Link>
      </div>

      <div className="p-6 flex flex-col h-[calc(100vh-64px)]">
        {/* Title Section */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-mobile-text">Let's Get Started</h1>
          <p className="text-mobile-text opacity-80">Please select your preferred delivery channel</p>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {vehicles.map((vehicle) => {
            const Icon = vehicle.icon;
            return (
              <button
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle.id)}
                className={
                  selectedVehicle === vehicle.id
                    ? "aspect-square p-4 rounded-2xl flex flex-col items-center justify-center gap-2 bg-stone-500 text-mobile-text"
                    : "aspect-square p-4 rounded-2xl flex flex-col items-center justify-center gap-2 bg-[#F2E7D8] text-mobile-text"
                }
              >
                <Icon className="w-8 h-8" />
                <span className="font-medium">{vehicle.label}</span>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="mt-auto">
          <Link
            to="/app/agents/register-form"
            className={
              selectedVehicle
                ? "w-full py-3 px-6 rounded-2xl font-medium bg-stone-500 text-mobile-text text-center block"
                : "w-full py-3 px-6 rounded-2xl font-medium bg-stone-500/50 text-mobile-text/50 text-center block pointer-events-none"
            }
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/register")({
  component: RegisterScreen,
}); 