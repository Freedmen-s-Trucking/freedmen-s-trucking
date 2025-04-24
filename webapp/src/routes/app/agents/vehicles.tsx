import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack, IoAdd, IoCheckmarkCircle } from "react-icons/io5";
import { useNavigate } from "@tanstack/react-router";

interface VehicleItem {
  id: string;
  type: "car" | "bike";
  model: string;
  year: string;
  plateNumber: string;
  isActive: boolean;
}

function VehiclesScreen() {
  const navigate = useNavigate();

  const vehicles: VehicleItem[] = [
    {
      id: "1",
      type: "car",
      model: "Toyota Corolla",
      year: "2007",
      plateNumber: "EPE 123 YT",
      isActive: true
    },
    {
      id: "2",
      type: "bike",
      model: "Suzuki 23S",
      year: "2015",
      plateNumber: "IKJ 631 YT",
      isActive: false
    }
  ];

  return (
    <div className="min-h-screen bg-mobile-background font-mobile">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-mobile-text">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="text-mobile-text"
          >
            <IoChevronBack className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-medium text-mobile-text">Vehicles</h1>
        </div>
        <button
          onClick={() => navigate({ to: "/" })}
          className="text-mobile-text"
        >
          <IoAdd className="w-6 h-6" />
        </button>
      </div>

      {/* Vehicle List */}
      <div className="p-4 space-y-3">
        {vehicles.map((vehicle) => (
          <button
            key={vehicle.id}
            onClick={() => navigate({ to: `/app/agents/vehicles/${vehicle.plateNumber}` })}
            className="w-full flex items-center gap-4 p-4 bg-mobile-background  rounded-2xl"
          >
            <div className="w-10 h-10 bg-stone-500 rounded-xl flex items-center justify-center text-xl">
              {vehicle.type === "car" ? "🚗" : "🏍️"}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm text-mobile-text">
                {vehicle.type === "car" ? "Vehicle" : "Bike"} • {vehicle.model} {vehicle.year}
              </div>
              <div className="font-medium text-mobile-text">{vehicle.plateNumber}</div>
            </div>
            {vehicle.isActive && (
              <IoCheckmarkCircle className="w-6 h-6 text-green-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/vehicles")({
  component: VehiclesScreen,
}); 