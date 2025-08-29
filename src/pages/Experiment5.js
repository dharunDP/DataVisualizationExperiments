import React, { useState, useMemo } from "react";
import Papa from "papaparse";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

/*
CSV expected format (wide format):

Timestamp,Sensor_A,Sensor_B,Sensor_C
2025-08-01 08:00,23.5,21.8,24.0
2025-08-01 12:00,24.1,22.0,24.3
...

The component will also try "Time" or "Date" as the first column name.
*/

const COLORS = [
  "#1976d2",
  "#e53935",
  "#43a047",
  "#fb8c00",
  "#8e24aa",
  "#00acc1",
  "#f06292",
  "#5c6bc0",
  "#7cb342",
  "#ff7043",
];

function movingAverage(arr, windowSize = 3) {
  if (windowSize <= 1) return arr.slice();
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const win = arr.slice(start, i + 1);
    const avg = win.reduce((s, v) => s + (v ?? 0), 0) / win.length;
    res.push(Number(avg.toFixed(3)));
  }
  return res;
}

export default function Experiment5() {
  const [rawData, setRawData] = useState([]); // array of objects
  const [columnNames, setColumnNames] = useState([]); // includes timestamp + sensors
  const [visibleSensors, setVisibleSensors] = useState({}); // {sensor: true}
  const [smoothing, setSmoothing] = useState(false);
  const [maWindow, setMaWindow] = useState(3);
  const [lowAlert, setLowAlert] = useState("");
  const [highAlert, setHighAlert] = useState("");

  // Load CSV handler
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (res) => {
        if (!res || !res.data || res.data.length === 0) {
          alert("No data parsed from CSV.");
          return;
        }
        // Try find timestamp column
        let keys = Object.keys(res.data[0]);
        const tsKey =
          keys.find((k) =>
            ["timestamp", "time", "date"].includes(k.toLowerCase())
          ) || keys[0];

        // Normalize each row: keep Timestamp as string and sensor cols numeric or null
        const normalized = res.data.map((row) => {
          const obj = {};
          obj["Timestamp"] = row[tsKey];
          keys.forEach((k) => {
            if (k === tsKey) return;
            const v = row[k];
            obj[k] =
              v === "" || v === null || v === undefined ? null : Number(v);
          });
          return obj;
        });

        const sensors = keys.filter((k) => k !== tsKey);
        const vis = {};
        sensors.forEach((s) => (vis[s] = true));
        setRawData(normalized);
        setColumnNames(["Timestamp", ...sensors]);
        setVisibleSensors(vis);
      },
      error: (err) => {
        alert("CSV parse error: " + err.message);
      },
    });
  };

  // Sample CSV download
  const handleDownloadSample = () => {
    const csv = `Timestamp,Sensor_A,Sensor_B,Sensor_C,Sensor_D
2025-08-01 08:00,23.5,21.8,24.0,22.6
2025-08-01 12:00,24.1,22.0,24.3,22.9
2025-08-01 16:00,23.8,21.7,24.1,22.7
2025-08-02 08:00,23.2,21.3,23.6,22.1
2025-08-02 12:00,24.6,22.6,24.8,23.0
2025-08-02 16:00,25.0,23.1,25.2,23.6
2025-08-03 08:00,24.3,22.4,24.5,22.8
2025-08-03 12:00,23.9,22.0,24.2,22.5
2025-08-03 16:00,23.1,21.5,23.7,22.0`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "soil_moisture_sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Toggle visibility
  const toggleSensor = (s) => {
    setVisibleSensors((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  // Prepare chart data: optionally smoothed
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0 || columnNames.length < 2) return [];

    // Build series per sensor
    const sensors = columnNames.slice(1);
    const seriesValues = {};
    sensors.forEach((s) => {
      seriesValues[s] = rawData.map((r) =>
        r[s] === null || isNaN(r[s]) ? null : r[s]
      );
    });

    // Apply moving average if smoothing
    const seriesSmoothed = {};
    sensors.forEach((s) => {
      if (smoothing) {
        seriesSmoothed[s] = movingAverage(
          seriesValues[s],
          Math.max(1, Math.round(maWindow))
        );
      } else {
        seriesSmoothed[s] = seriesValues[s];
      }
    });

    // Compose chart rows (keep Timestamp as label)
    const rows = rawData.map((r, idx) => {
      const obj = { Timestamp: String(r.Timestamp) };
      sensors.forEach((s) => {
        obj[s] =
          seriesSmoothed[s][idx] === null ? undefined : seriesSmoothed[s][idx];
      });
      return obj;
    });

    return rows;
  }, [rawData, columnNames, smoothing, maWindow]);

  // Colors mapping for sensors
  const sensorColors = useMemo(() => {
    const mapping = {};
    columnNames.slice(1).forEach((s, i) => {
      mapping[s] = COLORS[i % COLORS.length];
    });
    return mapping;
  }, [columnNames]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Soil Moisture Analysis — Multiple Sensors
      </h1>

      <div className="flex gap-3 flex-wrap mb-4">
        <input type="file" accept=".csv" onChange={handleFile} />
        <button
          onClick={handleDownloadSample}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Download Sample CSV
        </button>

        <label className="flex items-center gap-2 ml-2">
          <input
            type="checkbox"
            checked={smoothing}
            onChange={() => setSmoothing(!smoothing)}
          />
          Smoothing (moving avg)
        </label>

        {smoothing && (
          <label className="flex items-center gap-2 ml-2">
            Window:
            <input
              type="number"
              value={maWindow}
              min={1}
              max={10}
              onChange={(e) => setMaWindow(Number(e.target.value) || 1)}
              className="w-16 ml-1 p-1 border rounded"
            />
          </label>
        )}

        <label className="flex items-center gap-2 ml-2">
          Low alert:
          <input
            value={lowAlert}
            onChange={(e) => setLowAlert(e.target.value)}
            placeholder="e.g. 18"
            className="w-20 ml-1 p-1 border rounded"
          />
        </label>

        <label className="flex items-center gap-2 ml-2">
          High alert:
          <input
            value={highAlert}
            onChange={(e) => setHighAlert(e.target.value)}
            placeholder="e.g. 26"
            className="w-20 ml-1 p-1 border rounded"
          />
        </label>
      </div>

      {/* Sensor toggles */}
      {columnNames.length > 1 && (
        <div className="mb-4 flex gap-3 flex-wrap">
          {columnNames.slice(1).map((s) => (
            <button
              key={s}
              onClick={() => toggleSensor(s)}
              className={`px-3 py-1 rounded border ${
                visibleSensors[s]
                  ? "bg-blue-600 text-white border-blue-700"
                  : "bg-white text-gray-700"
              }`}
              style={{ borderColor: sensorColors[s] }}
            >
              {visibleSensors[s] ? "✓ " : ""}
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      <div
        style={{ width: "100%", height: 420 }}
        className="bg-white p-4 rounded shadow"
      >
        {chartData.length === 0 ? (
          <div className="text-gray-600">
            Upload a CSV (Timestamp + sensors) or download sample to begin.
          </div>
        ) : (
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="Timestamp"
                angle={-30}
                textAnchor="end"
                height={70}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {columnNames
                .slice(1)
                .map((s) =>
                  visibleSensors[s] ? (
                    <Line
                      key={s}
                      type="monotone"
                      dataKey={s}
                      stroke={sensorColors[s]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls={true}
                    />
                  ) : null
                )}
              {/* Alert lines */}
              {lowAlert !== "" && !isNaN(Number(lowAlert)) && (
                <ReferenceLine
                  y={Number(lowAlert)}
                  stroke="#ff7043"
                  strokeDasharray="4 4"
                  label={`Low Alert (${lowAlert})`}
                />
              )}
              {highAlert !== "" && !isNaN(Number(highAlert)) && (
                <ReferenceLine
                  y={Number(highAlert)}
                  stroke="#e53935"
                  strokeDasharray="4 4"
                  label={`High Alert (${highAlert})`}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Data preview */}
      {rawData.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded shadow overflow-auto">
          <h3 className="font-semibold mb-2">Data preview (first 20 rows)</h3>
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {columnNames.map((c) => (
                  <th key={c} className="p-2 border text-left">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rawData.slice(0, 20).map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {columnNames.map((c) => (
                    <td key={c} className="p-2 border">
                      {String(row[c] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Short interpretation */}
      {rawData.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded shadow text-sm">
          <strong>Quick interpretation tips:</strong>
          <ul className="list-disc ml-6 mt-2">
            <li>
              Compare sensor trajectories to spot dry/wet patches or sensor
              drift.
            </li>
            <li>
              Smoothing helps reveal slower trends; raw lines show short
              fluctuations.
            </li>
            <li>
              Set low/high alert thresholds to highlight possible irrigation or
              sensor issues.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
