import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack, IoCamera } from "react-icons/io5";

function DropOffPhotoScreen() {
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
        <h1 className="text-xl font-medium">Drop off process</h1>
      </div>

      <div className="p-6 flex flex-col h-[calc(100vh-64px)]">
        {/* Photo Upload Section */}
        <div className="flex-1">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <IoCamera className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-base text-gray-600 text-center">
              Take proof of delivery photo
            </p>
          </div>
        </div>

        {/* Complete Button */}
        <button className="w-full px-4 py-3 text-white bg-teal-600 rounded-xl font-medium mt-6">
          Complete
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/drop-off-photo")({
  component: DropOffPhotoScreen,
}); 