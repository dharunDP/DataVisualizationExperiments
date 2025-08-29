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
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from "recharts";

/*
Accepted CSV columns (case-insensitive):
Date, Location, Confirmed, Recovered, Deaths

Date format: YYYY-MM-DD is preferred but common formats are tolerated by JS Date.
*/

function parseDate(s) {
  // try ISO first, fallback to Date parse
  const d = new Date(s);
  if (isNaN(d)) return null;
  // return YYYY-MM-DD for consistent keys and display
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function movingAverage(arr, window = 7) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = arr.slice(start, i + 1);
    const sum = slice.reduce((s, v) => s + v, 0);
    out.push(Number((sum / slice.length).toFixed(2)));
  }
  return out;
}

export default function Experiment7() {
  const [rawRows, setRawRows] = useState([]); // parsed rows
  const [locations, setLocations] = useState([]); // unique locations
  const [selectedLocation, setSelectedLocation] = useState("");
  const [message, setMessage] = useState("");

  // parse CSV file
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (res) => {
        if (!res || !res.data || res.data.length === 0) {
          setMessage("No data parsed from CSV.");
          return;
        }
        // normalize rows
        const normalized = [];
        res.data.forEach((r) => {
          const keys = Object.keys(r);
          const row = {};
          keys.forEach((k) => {
            row[k.trim()] = r[k];
          });

          // find columns case-insensitive
          const dateKey = keys.find((k) => k.toLowerCase().includes("date")) ?? keys[0];
          const locKey = keys.find((k) => k.toLowerCase().includes("location")) ?? keys.find((k) => k.toLowerCase().includes("place")) ?? keys[1] ?? keys[0];
          const confirmedKey = keys.find((k) => k.toLowerCase().includes("confirm")) ?? keys.find((k) => k.toLowerCase().includes("cases")) ?? null;
          const recoveredKey = keys.find((k) => k.toLowerCase().includes("recover")) ?? null;
          const deathsKey = keys.find((k) => k.toLowerCase().includes("death")) ?? keys.find((k) => k.toLowerCase().includes("dead")) ?? null;

          const parsedDate = parseDate(row[dateKey]);
          if (!parsedDate) return; // skip malformed date

          normalized.push({
            date: parsedDate,
            location: String(row[locKey] ?? "Unknown").trim(),
            confirmed: confirmedKey ? Number(row[confirmedKey] ?? 0) : Number(row[keys[2]] ?? 0),
            recovered: recoveredKey ? Number(row[recoveredKey] ?? 0) : 0,
            deaths: deathsKey ? Number(row[deathsKey] ?? 0) : 0,
          });
        });

        if (normalized.length === 0) {
          setMessage("No valid rows after parsing. Check CSV headers and date formats.");
          return;
        }

        setRawRows(normalized);
        const uniqLoc = Array.from(new Set(normalized.map((r) => r.location))).sort();
        setLocations(uniqLoc);
        setSelectedLocation(uniqLoc[0] ?? "");
        setMessage(`Loaded ${normalized.length} rows across ${uniqLoc.length} location(s).`);
      },
      error: (err) => {
        setMessage("CSV parse error: " + err.message);
      },
    });
  };

  // sample CSV download
  const downloadSample = () => {
    const csv = `Date,Location,Confirmed,Recovered,Deaths
2025-08-01,CityA,10,0,0
2025-08-02,CityA,12,1,0
2025-08-03,CityA,15,2,0
2025-08-01,CityB,5,0,0
2025-08-02,CityB,7,0,0
2025-08-03,CityB,9,1,0
2025-08-01,CityC,20,1,1
2025-08-02,CityC,22,2,1
2025-08-03,CityC,25,3,1
`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "covid_sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // aggregated & transformed data for selected location
  const transformed = useMemo(() => {
    if (!selectedLocation || rawRows.length === 0) return { timeSeries: [], totals: {}, insights: {} };

    // filter by location
    const rows = rawRows.filter((r) => r.location === selectedLocation);

    // aggregate by date in case multiple rows per date
    const map = {};
    rows.forEach((r) => {
      if (!map[r.date]) map[r.date] = { confirmed: 0, recovered: 0, deaths: 0 };
      map[r.date].confirmed += Number(r.confirmed || 0);
      map[r.date].recovered += Number(r.recovered || 0);
      map[r.date].deaths += Number(r.deaths || 0);
    });

    // convert to sorted array of dates
    const dates = Object.keys(map).sort();
    const timeSeries = dates.map((d) => ({ date: d, ...map[d] }));

    // compute cumulative confirmed and daily new cases
    let cumulative = 0;
    const withCumulative = timeSeries.map((t) => {
      cumulative += Number(t.confirmed || 0);
      return { ...t, cumulativeConfirmed: cumulative };
    });

    // compute daily new cases (if confirmed is cumulative in source, this will be raw; we assume input is daily counts)
    // If input were cumulative, you'd compute diff here; we assume daily-case input as default.

    const dailyNew = withCumulative.map((t, i) => {
      // daily new = confirmed (because we treat provided as daily)
      return { date: t.date, newCases: Number(t.confirmed || 0), cumulative: t.cumulativeConfirmed, recovered: t.recovered || 0, deaths: t.deaths || 0 };
    });

    // 7-day moving average on newCases
    const newVals = dailyNew.map((d) => d.newCases);
    const ma7 = movingAverage(newVals, 7);

    const finalSeries = dailyNew.map((d, i) => ({ ...d, ma7: ma7[i] }));

    // totals
    const totals = finalSeries.reduce(
      (acc, cur) => {
        acc.confirmed += cur.newCases;
        acc.recovered += cur.recovered;
        acc.deaths += cur.deaths;
        acc.cumulative = cur.cumulative; // last cumulative will be final cumulative
        return acc;
      },
      { confirmed: 0, recovered: 0, deaths: 0, cumulative: 0 }
    );

    const active = totals.cumulative - totals.recovered - totals.deaths;
    const cfr = totals.confirmed > 0 ? (totals.deaths / totals.confirmed) * 100 : 0;
    const recoveryRate = totals.confirmed > 0 ? (totals.recovered / totals.confirmed) * 100 : 0;

    const insights = {
      totalConfirmed: totals.cumulative,
      newConfirmed: totals.confirmed,
      totalRecovered: totals.recovered,
      totalDeaths: totals.deaths,
      active: active,
      cfr: Number(cfr.toFixed(2)),
      recoveryRate: Number(recoveryRate.toFixed(2)),
      latestDay: finalSeries.length ? finalSeries[finalSeries.length - 1].date : null,
      latestNew: finalSeries.length ? finalSeries[finalSeries.length - 1].newCases : null,
    };

    return { timeSeries: finalSeries, totals, insights };
  }, [rawRows, selectedLocation]);

  // quick list of available locations
  const locationOptions = locations;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">COVID-19 Dashboard — Experiment 7</h1>

      <div className="flex gap-3 items-center mb-4 flex-wrap">
        <input type="file" accept=".csv" onChange={handleFile} />
        <button onClick={downloadSample} className="px-3 py-1 bg-blue-600 text-white rounded">Download Sample CSV</button>

        <label className="ml-4">Location:</label>
        <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="p-2 border rounded">
          {locationOptions.length === 0 && <option value="">(no locations loaded)</option>}
          {locationOptions.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <div className="ml-auto text-sm text-gray-600">{message}</div>
      </div>

      {/* If no location selected, show note */}
      {!selectedLocation ? (
        <div className="p-6 bg-white rounded shadow text-center text-gray-600">Upload a CSV and select a location to see visualizations.</div>
      ) : (
        <>
          {/* Top summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Total Confirmed (cumulative)</div>
              <div className="text-2xl font-bold">{transformed.insights.totalConfirmed ?? 0}</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Active (est.)</div>
              <div className="text-2xl font-bold">{transformed.insights.active ?? 0}</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Total Recovered</div>
              <div className="text-2xl font-bold">{transformed.insights.totalRecovered ?? 0}</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Total Deaths</div>
              <div className="text-2xl font-bold">{transformed.insights.totalDeaths ?? 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: daily new + MA line chart */}
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Daily New Cases & 7-day MA</h3>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={transformed.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="newCases" name="Daily New" stroke="#ff7043" dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="ma7" name="7-day MA" stroke="#1976d2" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: cumulative area + totals bar */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-2">Cumulative Confirmed</h3>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer>
                    <AreaChart data={transformed.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke="#4caf50" fill="#c8e6c9" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-2">Totals Comparison</h3>
                <div style={{ width: "100%", height: 140 }}>
                  <ResponsiveContainer>
                    <BarChart data={[
                      { name: "Confirmed", value: transformed.insights.totalConfirmed ?? 0 },
                      { name: "Recovered", value: transformed.insights.totalRecovered ?? 0 },
                      { name: "Deaths", value: transformed.insights.totalDeaths ?? 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        <Cell fill="#ff7043" />
                        <Cell fill="#4caf50" />
                        <Cell fill="#9e9e9e" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Insights & table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Insights</h3>
              <ul className="text-sm space-y-2">
                <li><strong>Latest date:</strong> {transformed.insights.latestDay ?? "-"}</li>
                <li><strong>Latest new cases:</strong> {transformed.insights.latestNew ?? "-"}</li>
                <li><strong>Case Fatality Rate (CFR):</strong> {transformed.insights.cfr ?? 0}%</li>
                <li><strong>Recovery rate:</strong> {transformed.insights.recoveryRate ?? 0}%</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded shadow overflow-auto">
              <h3 className="font-semibold mb-2">Data Table (last 30 rows)</h3>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-right">New Cases</th>
                    <th className="p-2 text-right">7-day MA</th>
                    <th className="p-2 text-right">Cumulative</th>
                    <th className="p-2 text-right">Recovered</th>
                    <th className="p-2 text-right">Deaths</th>
                  </tr>
                </thead>
                <tbody>
                  {transformed.timeSeries.slice(-30).map((r) => (
                    <tr key={r.date}>
                      <td className="p-2">{r.date}</td>
                      <td className="p-2 text-right">{r.newCases}</td>
                      <td className="p-2 text-right">{r.ma7 ?? "-"}</td>
                      <td className="p-2 text-right">{r.cumulative}</td>
                      <td className="p-2 text-right">{r.recovered}</td>
                      <td className="p-2 text-right">{r.deaths}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
