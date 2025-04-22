import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack, IoWarning } from "react-icons/io5";
import { useNavigate } from "@tanstack/react-router";

interface DocumentItem {
  id: string;
  icon: string;
  label: string;
  status: "pending" | "verified";
  route: string;
}

function DocumentsScreen() {
  const navigate = useNavigate();

  const documents: DocumentItem[] = [
    {
      id: "driver-photo",
      icon: "👤",
      label: "Driver's Photo",
      status: "pending",
      route: "/app/agents/documents/driver-photo"
    },
    {
      id: "id-front",
      icon: "📄",
      label: "Identity Card (front)",
      status: "pending",
      route: "/app/agents/documents/id-front"
    },
    {
      id: "id-back",
      icon: "📄",
      label: "Identity Card (back)",
      status: "pending",
      route: "/app/agents/documents/id-back"
    }
  ];

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
        <h1 className="text-xl font-medium">Documents</h1>
      </div>

      {/* Document List */}
      <div className="p-4 space-y-3">
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => navigate({ to: doc.route })}
            className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
              {doc.icon}
            </div>
            <span className="flex-1 text-left text-gray-700">{doc.label}</span>
            {doc.status === "pending" && (
              <IoWarning className="w-6 h-6 text-red-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/documents")({
  component: DocumentsScreen,
}); 