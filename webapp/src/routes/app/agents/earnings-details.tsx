import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack, IoTime, IoGrid } from "react-icons/io5";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function EarningsDetailsScreen() {
  const dates = ['14', '15', '16', '17', '18', '19', '20'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const data = {
    labels: dates.map((date, index) => `${date}\n${days[index]}`),
    datasets: [
      {
        data: [4000, 5000, 3500, 4500, 5500, 4800, 3800],
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.5)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgb(20, 184, 166)',
        pointBorderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `₦${context.raw.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `${value/1000}k`
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
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
        <h1 className="text-xl font-medium">Dec 14 - Dec 21</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Earnings Amount */}
        <div className="text-center">
          <div className="text-4xl font-semibold">₦750.45</div>
        </div>

        {/* Graph */}
        <div className="h-64">
          <Line data={data} options={options} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <IoTime className="w-6 h-6 text-teal-600" />
              <span className="text-gray-600">Time</span>
            </div>
            <div className="text-lg font-medium">42h 32m</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <IoGrid className="w-6 h-6 text-teal-600" />
              <span className="text-gray-600">Deliveries</span>
            </div>
            <div className="text-lg font-medium">38</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/agents/earnings-details")({
  component: EarningsDetailsScreen,
}); 