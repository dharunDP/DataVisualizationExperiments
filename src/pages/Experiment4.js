// src/pages/Experiment4.js
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

const Experiment4 = () => {
  // Integrated sample dataset (daily website traffic for one week)
  const data = [
    { day: "Mon", visits: 1200, unique: 900, bounceRate: 45, avgSession: 3.2 },
    { day: "Tue", visits: 1500, unique: 1100, bounceRate: 42, avgSession: 3.6 },
    { day: "Wed", visits: 1700, unique: 1350, bounceRate: 40, avgSession: 4.1 },
    { day: "Thu", visits: 1600, unique: 1300, bounceRate: 39, avgSession: 3.9 },
    { day: "Fri", visits: 2100, unique: 1700, bounceRate: 38, avgSession: 4.5 },
    { day: "Sat", visits: 900, unique: 700, bounceRate: 55, avgSession: 2.6 },
    { day: "Sun", visits: 800, unique: 650, bounceRate: 58, avgSession: 2.4 },
  ];

  // Compute moving average (3-day) for visits
  const withMovingAvg = useMemo(() => {
    const arr = data.map((d) => ({ ...d }));
    for (let i = 0; i < arr.length; i++) {
      const slice = arr.slice(Math.max(0, i - 2), i + 1);
      const avg = slice.reduce((s, x) => s + x.visits, 0) / slice.length;
      arr[i].visitsMA = Number(avg.toFixed(1));
    }
    return arr;
  }, [data]);

  // Simple trend stats for interpretation
  const stats = useMemo(() => {
    const total = data.reduce((s, d) => s + d.visits, 0);
    const avg = total / data.length;
    const peak = data.reduce((p, d) => (d.visits > p.visits ? d : p), data[0]);
    const trough = data.reduce(
      (t, d) => (d.visits < t.visits ? d : t),
      data[0]
    );
    const changePct =
      ((data[data.length - 1].visits - data[0].visits) / data[0].visits) * 100;
    const weekdayVsWeekendAvg =
      data.slice(0, 5).reduce((s, d) => s + d.visits, 0) / 5 -
      data.slice(5).reduce((s, d) => s + d.visits, 0) / 2;
    return {
      total,
      avg: Math.round(avg),
      peakDay: peak.day,
      peakVal: peak.visits,
      troughDay: trough.day,
      troughVal: trough.visits,
      changePct: Number(changePct.toFixed(1)),
      weekdayVsWeekendDiff: Math.round(weekdayVsWeekendAvg),
    };
  }, [data]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Experiment 4 — Website Traffic Analysis
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visits line + moving average (large) */}
        <div className="col-span-1 lg:col-span-2 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Daily Visits (with 3-day MA)</h3>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <LineChart
                data={withMovingAvg}
                margin={{ top: 12, right: 24, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="visits"
                  name="Visits"
                  stroke="#1976d2"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="visitsMA"
                  name="3-day MA"
                  stroke="#ff9800"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick stats / insights */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Insights</h3>
          <ul className="text-sm space-y-2">
            <li>
              <strong>Average daily visits:</strong> {stats.avg}
            </li>
            <li>
              <strong>Peak day:</strong> {stats.peakDay} ({stats.peakVal}{" "}
              visits)
            </li>
            <li>
              <strong>Lowest day:</strong> {stats.troughDay} ({stats.troughVal}{" "}
              visits)
            </li>
            <li>
              <strong>Week start → end change:</strong> {stats.changePct}%
            </li>
            <li>
              <strong>Weekday vs weekend difference:</strong> ~
              {stats.weekdayVsWeekendDiff} visits (weekday avg higher)
            </li>
          </ul>

          <div className="mt-4 text-sm text-gray-700">
            <p>
              <strong>Interpretation:</strong>
            </p>
            <p>
              Traffic peaks on <strong>{stats.peakDay}</strong> (likely
              business-day behavior). Weekends (Sat–Sun) show lower visits and
              higher bounce rate, suggesting less engaged users. The 3-day
              moving average smooths short-term spikes and confirms the mid-week
              uptick.
            </p>
          </div>
        </div>
      </div>

      {/* Secondary charts: Unique Visitors, Avg Session, Bounce Rate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Unique Visitors</h4>
          <div style={{ height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="unique" name="Unique Visitors" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Avg Session Duration (min)</h4>
          <div style={{ height: 200 }}>
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="avgSession"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorAvg)"
                  name="Avg Session"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Bounce Rate (%)</h4>
          <div style={{ height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="bounceRate"
                  name="Bounce Rate (%)"
                  fill="#f44336"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Footer interpretation */}
      <div className="bg-white p-4 rounded shadow mt-6">
        <h4 className="font-semibold mb-2">Trend Interpretation</h4>
        <p className="text-sm">
          The mid-week (Wed–Fri) increase in visits and unique visitors with
          lower bounce rates + longer sessions suggests user engagement is
          strongest on business days. The weekend drop (Sat–Sun) indicates
          casual browsing sessions — consider tailoring weekend content or
          running campaigns to boost engagement. Watch for sustained changes in
          the 3-day moving average as a signal of real trend shifts.
        </p>
      </div>
    </div>
  );
};

export default Experiment4;
