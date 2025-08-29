// src/App.js
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Experiment1 from "./pages/Experiment1";
import Experiment2 from "./pages/Experiment2";
import Experiment3 from "./pages/Experiment3";
import Experiment4 from "./pages/Experiment4";
import Experiment5 from "./pages/Experiment5";
import Experiment6 from "./pages/Experiment6";
import Experiment7 from "./pages/Experiment7";

function Home() {
  const experiments = [
    {
      id: 1,
      title: "Experiment 1",
      desc: "Employee Data Preprocessing & Visualization",
      path: "/experiment1",
    },
    {
      id: 2,
      title: "Experiment 2",
      desc: "Weather Forecasting Data Visualization",
      path: "/experiment2",
    },
    {
      id: 3,
      title: "Experiment 3",
      desc: "Monitoring Chart with Control Limits",
      path: "/experiment3",
    },
    {
      id: 4,
      title: "Experiment 4",
      desc: "Website Traffic Trend Analysis",
      path: "/experiment4",
    },
    {
      id: 5,
      title: "Experiment 5",
      desc: "Soil Moisture Analysis (Multi-Sensor)",
      path: "/experiment5",
    },
    {
      id: 6,
      title: "Experiment 6",
      desc: "Temperature Distribution Boxplot",
      path: "/experiment6",
    },
    {
      id: 7,
      title: "Experiment 7",
      desc: "COVID-19 Case Insights Dashboard",
      path: "/experiment7",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8">
        Data Visualization Dashboard - DharunPranav S K [7376222AD127]
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {experiments.map((exp) => (
          <div
            key={exp.id}
            className="bg-white w-72 shadow-lg rounded-2xl p-6 flex flex-col items-center"
          >
            <h2 className="text-xl font-semibold mb-4">{exp.title}</h2>
            <p className="text-gray-600 mb-4 text-center">{exp.desc}</p>
            <Link to={exp.path}>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                Open
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiment1" element={<Experiment1 />} />
        <Route path="/experiment2" element={<Experiment2 />} />
        <Route path="/experiment3" element={<Experiment3 />} />
        <Route path="/experiment4" element={<Experiment4 />} />
        <Route path="/experiment5" element={<Experiment5 />} />
        <Route path="/experiment6" element={<Experiment6 />} />
        <Route path="/experiment7" element={<Experiment7 />} />
      </Routes>
    </Router>
  );
}
