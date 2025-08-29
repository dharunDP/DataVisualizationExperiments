// src/pages/Experiment3.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

const Experiment3 = () => {
  // Sample dataset with subgroups
  const data = [
    { subgroup: "A1", series1: 50, series2: 55 },
    { subgroup: "A2", series1: 52, series2: 54 },
    { subgroup: "A3", series1: 49, series2: 53 },
    { subgroup: "A4", series1: 60, series2: 57 },
    { subgroup: "B1", series1: 62, series2: 59 },
    { subgroup: "B2", series1: 58, series2: 56 },
    { subgroup: "B3", series1: 65, series2: 61 },
    { subgroup: "B4", series1: 63, series2: 64 },
    { subgroup: "C1", series1: 55, series2: 52 },
    { subgroup: "C2", series1: 54, series2: 53 },
  ];

  // Control limits and target
  const UCL = 65; // Upper Control Limit
  const LCL = 45; // Lower Control Limit
  const Target = 55; // Target reference

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Experiment 3 - Monitoring Chart with Subgroups
      </h2>
      <LineChart
        width={800}
        height={400}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="subgroup" />
        <YAxis />
        <Tooltip />
        <Legend />

        {/* Data series */}
        <Line
          type="monotone"
          dataKey="series1"
          stroke="#8884d8"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="series2"
          stroke="#82ca9d"
          strokeWidth={2}
        />

        {/* Control limits */}
        <ReferenceLine y={UCL} label="UCL" stroke="red" strokeDasharray="5 5" />
        <ReferenceLine y={LCL} label="LCL" stroke="red" strokeDasharray="5 5" />

        {/* Target line */}
        <ReferenceLine
          y={Target}
          label="Target"
          stroke="blue"
          strokeDasharray="3 3"
        />
      </LineChart>
    </div>
  );
};

export default Experiment3;
