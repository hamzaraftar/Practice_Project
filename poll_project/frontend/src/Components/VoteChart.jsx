import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const VoteChart = ({ poll }) => {
  if (!poll || !poll.options) return null;

  const labels = poll.options.map((opt) => opt.text);
  const data = poll.options.map((opt) => opt.votes_count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Number of Votes",
        data,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Votes for: ${poll.question}`,
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2 text-center text-lg">📊 Vote Chart</h3>
      <Bar data={chartData} options={chartOptions} />
      <p className="mt-2 text-center text-gray-600">
        🏆 Most voted option:{" "}
        <strong>
          {labels[data.indexOf(Math.max(...data))] || "No votes yet"}
        </strong>
      </p>
    </div>
  );
};

export default VoteChart;
