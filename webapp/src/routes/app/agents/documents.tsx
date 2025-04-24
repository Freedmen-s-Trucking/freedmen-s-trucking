import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack, IoWarning } from "react-icons/io5";
import { useNavigate } from "@tanstack/react-router";
import idFront from "@/assets/images/id-front.png";
import idBack from "@/assets/images/id-back.png";
import { Link } from "@tanstack/react-router";
interface DocumentItem {
  id: string;
  image: string;
  label: string;
  status: "pending" | "verified";
  route: string;
}

function DocumentsScreen() {
  const navigate = useNavigate();

  const documents: DocumentItem[] = [
    {
      id: "driver-photo",
      image: idFront,
      label: "Driver's Photo",
      status: "pending",
      route: "/app/agents/documents/id-front"
    },
    {
      id: "id-front",
      image: idFront,
      label: "Identity Card (front)",
      status: "pending",
      route: "/app/agents/documents/id-front"
    },
    {
      id: "id-back",
      image: idBack,
      label: "Identity Card (back)",
      status: "pending",
      route: "/app/agents/documents/id-back"
    }
  ];

  return (
    <div className="min-h-screen bg-mobile-background font-mobile">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-mobile-text">
        <button
          onClick={() => window.history.back()}
          className="text-mobile-text"
        >
          <IoChevronBack className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium text-mobile-text">Documents</h1>
      </div>

      {/* Document List */}
      <div className="p-4 space-y-3">
        {documents.map((doc) => (
         <Link to="/app/agents/id-front" className="mb-3">
          <button
            key={doc.id}
            onClick={() => navigate({ to: doc.route })}
            className="w-full mb-3 flex items-center gap-4 p-4 bg-mobile-background border border-mobile-text rounded-2xl"
          >
            <div className="w-10 h-10 bg-stone-500  flex items-center justify-center overflow-hidden">
              <img 
                src={doc.image} 
                alt={doc.label}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="flex-1 text-left text-mobile-text">{doc.label}</span>
            {doc.status === "pending" && (
              <IoWarning className="w-6 h-6 text-red-500" />
            )}
          </button>
         </Link>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/documents")({
  component: DocumentsScreen,
}); 