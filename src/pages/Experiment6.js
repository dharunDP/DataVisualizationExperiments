// src/pages/Experiment6.jsx
import React from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  Line,
  Scatter,
} from "recharts";

// Synthetic multi-location temperature dataset
const data = [
  {
    location: "Chennai",
    temps: [30, 32, 33, 29, 31, 34, 32, 30, 29, 33, 35, 31],
  },
  {
    location: "Mumbai",
    temps: [28, 29, 27, 30, 31, 29, 28, 30, 27, 29, 28, 30],
  },
  {
    location: "Delhi",
    temps: [24, 26, 25, 27, 28, 29, 26, 25, 24, 27, 28, 26],
  },
  {
    location: "Bangalore",
    temps: [22, 23, 21, 22, 24, 23, 22, 21, 23, 22, 24, 23],
  },
  {
    location: "Hyderabad",
    temps: [26, 27, 28, 29, 27, 26, 28, 29, 27, 26, 28, 29],
  },
];

// Function to calculate boxplot stats
function calculateBoxplotStats(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const median = sorted[Math.floor(sorted.length * 0.5)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  return { min, q1, median, q3, max };
}

// Transform data for chart
const boxplotData = data.map((d) => {
  const stats = calculateBoxplotStats(d.temps);
  return { location: d.location, ...stats };
});

const Experiment6 = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Temperature Distribution by Location (Boxplot)
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={boxplotData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="location" />
          <YAxis />
          <Tooltip />
          {/* Whiskers */}
          <Line type="monotone" dataKey="min" stroke="#8884d8" dot={false} />
          <Line type="monotone" dataKey="max" stroke="#8884d8" dot={false} />
          {/* Q1 and Q3 */}
          <Line type="monotone" dataKey="q1" stroke="#82ca9d" dot={false} />
          <Line type="monotone" dataKey="q3" stroke="#82ca9d" dot={false} />
          {/* Median */}
          <Scatter dataKey="median" fill="red" name="Median" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Experiment6;
