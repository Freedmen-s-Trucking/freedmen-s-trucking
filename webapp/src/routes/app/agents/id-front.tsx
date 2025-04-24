import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack } from "react-icons/io5";
import idFront from "@/assets/images/id-front-big.png";
// import { useNavigate } from "@tanstack/react-router";

function IdentityCardFrontScreen() {
  // const navigate = useNavigate();

  const handleTakePhoto = () => {
    // Implement photo capture logic here
    console.log("Taking photo...");
  };

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
        <h1 className="text-xl font-medium text-mobile-text">Identity Card (front)</h1>
      </div>

      <div className="p-6 flex flex-col h-[calc(100vh-64px)]">
        {/* Instructions */}
        <div className="text-mobile-text text-sm mb-6">
          Make sure the entire ID and all the details are VISIBLE
        </div>

        {/* Photo Options */}
        <div className="flex gap-4 mb-6">
          <button className="text-mobile-text text-sm font-medium">
            Take a Photo
          </button>
          <button className="text-mobile-text text-sm font-medium">
            Upload a Photo
          </button>
        </div>

        {/* ID Card Preview Area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm aspect-[1.6] bg-[#F2E7D8] rounded-2xl border-2 border-dashed border-mobile-text flex flex-col items-center justify-center p-6 overflow-hidden">
            <img
              src={idFront}
              alt="ID Card Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Take Photo Button */}
        <button
          onClick={handleTakePhoto}
          className="w-full px-4 py-3 bg-stone-500 text-mobile-text rounded-2xl font-medium mt-6"
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