import { createFileRoute } from "@tanstack/react-router";
import { IoChevronBack, IoTime, IoGrid } from "react-icons/io5";
import { Line } from "react-chartjs-2";
import { MobileBottomBar } from "~/components/mobile/mobile-bottom-bar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem
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
        borderColor: '#2A4365',
        backgroundColor: 'rgba(42, 67, 101, 0.5)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'white',
        pointBorderColor: '#2A4365',
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
          label: (context: TooltipItem<"line">) => `₦${(context.raw as number).toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number | string) {
            return `${Number(value)/1000}k`;
          },
          color: '#4A5568'
        },
        grid: {
          color: '#E2E8F0'
        }
      },
      x: {
        ticks: {
          color: '#4A5568'
        },
        grid: {
          color: '#E2E8F0'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'nearest' as const
    }
  };

  return (
    <div className="min-h-screen bg-mobile-background font-mobile flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-200">
          <button
            onClick={() => window.history.back()}
            className="text-mobile-text"
          >
            <IoChevronBack className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-mobile text-mobile-text">Dec 14 - Dec 21</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Earnings Amount */}
          <div className="text-center">
            <div className="text-4xl font-semibold text-mobile-text">₦750.45</div>
          </div>

          {/* Graph */}
          <div className="h-64 bg-mobile-background rounded-xl p-4">
            <Line data={data} options={options} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-mobile-background border border-mobile-text p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <IoTime className="w-6 h-6 text-mobile-text" />
                <span className="text-gray-600">Time</span>
              </div>
              <div className="text-lg font-medium text-mobile-text">42h 32m</div>
            </div>
            <div className="bg-mobile-background border border-mobile-text p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <IoGrid className="w-6 h-6 text-mobile-text" />
                <span className="text-gray-600">Deliveries</span>
              </div>
              <div className="text-lg font-medium text-mobile-text">38</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar isAgent={true} />
    </div>
  );
}

export const Route = createFileRoute("/app/agents/earnings-details")({
  component: EarningsDetailsScreen,
}); 