import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack, IoPencil, IoWarning } from "react-icons/io5";
import { useNavigate } from "@tanstack/react-router";

interface VehicleDetail {
  label: string;
  value: string;
}

interface VehicleDocument {
  id: string;
  label: string;
  status: "pending" | "verified";
}

function VehicleDetailsScreen() {
  const navigate = useNavigate();

  const details: VehicleDetail[] = [
    { label: "Type", value: "Car" },
    { label: "Brand", value: "Toyota" },
    { label: "Model", value: "Corolla" },
    { label: "Year", value: "2007" },
    { label: "Color", value: "Red" },
    { label: "Registration", value: "EPE 123 YT" }
  ];

  const documents: VehicleDocument[] = [
    { id: "reg", label: "Registration", status: "pending" },
    { id: "insurance", label: "Insurance Policy", status: "pending" },
    { id: "roadworthy", label: "Road Worthiness", status: "pending" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="text-gray-700"
          >
            <IoChevronBack className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-medium">EPE 123 YT</h1>
        </div>
        <button className="text-teal-600">
          <IoPencil className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Vehicle Details */}
        <div className="grid grid-cols-2 gap-4">
          {details.map((detail, index) => (
            <div key={index} className="space-y-1">
              <div className="text-sm text-gray-500">{detail.label}</div>
              <div className="font-medium">{detail.value}</div>
            </div>
          ))}
        </div>

        {/* Documents Section */}
        <div>
          <h2 className="text-lg font-medium mb-3">Documents</h2>
          <div className="space-y-3">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => navigate({ to: `/app/agents/vehicles/documents/${doc.id}` })}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 text-blue-500">📄</div>
                </div>
                <span className="flex-1 text-left text-gray-700">{doc.label}</span>
                {doc.status === "pending" && (
                  <IoWarning className="w-6 h-6 text-red-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/vehicle-details")({
  component: VehicleDetailsScreen,
}); 