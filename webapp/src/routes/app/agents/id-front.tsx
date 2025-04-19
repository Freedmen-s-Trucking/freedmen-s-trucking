import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack, IoCamera } from "react-icons/io5";
import { useNavigate } from "@tanstack/react-router";

function IdentityCardFrontScreen() {
  const navigate = useNavigate();

  const handleTakePhoto = () => {
    // Implement photo capture logic here
    console.log("Taking photo...");
  };

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
        <h1 className="text-xl font-medium">Identity Card (front)</h1>
      </div>

      <div className="p-6 flex flex-col h-[calc(100vh-64px)]">
        {/* Instructions */}
        <div className="text-gray-600 text-sm mb-6">
          Make sure the entire ID and all the details are VISIBLE
        </div>

        {/* Photo Options */}
        <div className="flex gap-4 mb-6">
          <button className="text-teal-600 text-sm font-medium">
            Take a Photo
          </button>
          <button className="text-teal-600 text-sm font-medium">
            Upload a Photo
          </button>
        </div>

        {/* ID Card Preview Area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm aspect-[1.6] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6">
            <div className="w-32 h-32 bg-gray-100 rounded-lg mb-4">
              <img
                src="/id-card-placeholder.svg"
                alt="ID Card Preview"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Take Photo Button */}
        <button
          onClick={handleTakePhoto}
          className="w-full px-4 py-3 bg-teal-600 text-white rounded-xl font-medium mt-6"
        >
          Take Photo
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/id-front")({
  component: IdentityCardFrontScreen,
}); 