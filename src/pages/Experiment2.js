import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Experiment2 = () => {
  // 📌 Embedded dataset (converted from CSV into JSON format)
  const data = [
    {
      Date: "2025-01-01",
      Temperature: 25,
      Humidity: 70,
      WindSpeed: 12,
      Rainfall: 0,
    },
    {
      Date: "2025-01-02",
      Temperature: 27,
      Humidity: 65,
      WindSpeed: 10,
      Rainfall: 2,
    },
    {
      Date: "2025-01-03",
      Temperature: 26,
      Humidity: 72,
      WindSpeed: 8,
      Rainfall: 0,
    },
    {
      Date: "2025-01-04",
      Temperature: 28,
      Humidity: 68,
      WindSpeed: 15,
      Rainfall: 5,
    },
    {
      Date: "2025-01-05",
      Temperature: 30,
      Humidity: 60,
      WindSpeed: 20,
      Rainfall: 0,
    },
    // 🔽 Continue adding rows from your CSV here
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-center">
        🌦 Weather Forecasting Application
      </h1>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Temperature" stroke="#ff7300" />
          <Line type="monotone" dataKey="Humidity" stroke="#387908" />
          <Line type="monotone" dataKey="WindSpeed" stroke="#8884d8" />
          <Line type="monotone" dataKey="Rainfall" stroke="#1f77b4" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Experiment2;
