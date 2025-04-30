import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack, IoCamera } from "react-icons/io5";
import { MobileButton } from "../../../components/mobile/mobileButton";
import { useNavigate } from "@tanstack/react-router";

function DropOffPhotoScreen() {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate({ to: "/app/agents/home" });
  };

  return (
    <div className="min-h-screen bg-mobile-background font-mobile">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b bg-mobile-background">
        <button
          onClick={() => window.history.back()}
          className="text-mobile-text"
        >
          <IoChevronBack className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-mobile text-mobile-text">Drop off process</h1>
      </div>

      <div className="p-6 flex flex-col h-[calc(100vh-64px)]">
        {/* Photo Upload Section */}
        <div className="flex-1">
          <div className="border-2 border-dashed border-mobile-text  rounded-xl p-8 flex flex-col items-center justify-center bg-mobile-background">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3">
              <IoCamera className="w-6 h-6 text-mobile-text" />
            </div>
            <p className="text-base text-mobile-text text-center font-mobile">
              Take proof of delivery photo
            </p>
          </div>
        </div>

        {/* Complete Button */}
        <div className="mt-6">
          <MobileButton 
            link="/app/agents/home"
            isPrimary={true}
            text="Complete"
            onClick={handleComplete}
          />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/drop-off-photo")({
  component: DropOffPhotoScreen,
}); 