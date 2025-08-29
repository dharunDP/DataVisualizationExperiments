// src/pages/Experiment1.jsx
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  CartesianGrid,
  Legend,
} from "recharts";

export default function Experiment1() {
  const [cleanedData, setCleanedData] = useState([]);

  // Hardcoded dataset from employees.csv
  const dataset = [
    {
      EmployeeID: "E001",
      Name: "Rahul",
      PhoneNumber: "9876543210",
      Department: "HR",
      Salary: 50000,
      ExperienceYears: 5,
    },
    {
      EmployeeID: "E002",
      Name: "Priya",
      PhoneNumber: "9876501234",
      Department: "IT",
      Salary: 75000,
      ExperienceYears: 8,
    },
    {
      EmployeeID: "E003",
      Name: "Arjun",
      PhoneNumber: "9123456789",
      Department: "Finance",
      Salary: 62000,
      ExperienceYears: 6,
    },
    {
      EmployeeID: "E004",
      Name: "Meena",
      PhoneNumber: "9988776655",
      Department: "IT",
      Salary: 80000,
      ExperienceYears: 10,
    },
    {
      EmployeeID: "E005",
      Name: "Kiran",
      PhoneNumber: "9876123456",
      Department: "HR",
      Salary: 55000,
      ExperienceYears: 4,
    },
    {
      EmployeeID: "E006",
      Name: "Anita",
      PhoneNumber: "9765432109",
      Department: "Sales",
      Salary: 45000,
      ExperienceYears: 3,
    },
    {
      EmployeeID: "E007",
      Name: "Vikram",
      PhoneNumber: "9877001122",
      Department: "Finance",
      Salary: 67000,
      ExperienceYears: 7,
    },
    {
      EmployeeID: "E008",
      Name: "Sneha",
      PhoneNumber: "9654321098",
      Department: "Sales",
      Salary: 47000,
      ExperienceYears: 2,
    },
    {
      EmployeeID: "E009",
      Name: "Manoj",
      PhoneNumber: "9876665544",
      Department: "IT",
      Salary: 72000,
      ExperienceYears: 9,
    },
    {
      EmployeeID: "E010",
      Name: "Divya",
      PhoneNumber: "9766002211",
      Department: "HR",
      Salary: 53000,
      ExperienceYears: 5,
    },
  ];

  useEffect(() => {
    cleanData(dataset);
  }, []);

  const cleanData = (dataset) => {
    const seenIDs = new Set();
    const cleaned = dataset
      .filter((row) => {
        if (seenIDs.has(row.EmployeeID)) return false;
        seenIDs.add(row.EmployeeID);

        if (!/^[6-9]\d{9}$/.test(row.PhoneNumber)) return false;
        if (isNaN(row.Salary) || Number(row.Salary) <= 0) return false;
        if (isNaN(row.ExperienceYears) || Number(row.ExperienceYears) < 0)
          return false;

        return true;
      })
      .map((row) => ({
        ...row,
        Salary: Number(row.Salary),
        ExperienceYears: Number(row.ExperienceYears),
      }));

    setCleanedData(cleaned);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">
        Employee Data Preprocessing & Visualization
      </h1>

      {/* Charts */}
      {cleanedData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Salary Distribution */}
          <BarChart width={400} height={300} data={cleanedData}>
            <XAxis dataKey="Name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Salary" fill="#4F46E5" />
          </BarChart>

          {/* Employees per Department */}
          <PieChart width={400} height={300}>
            <Pie
              data={Object.values(
                cleanedData.reduce((acc, curr) => {
                  acc[curr.Department] = acc[curr.Department] || {
                    name: curr.Department,
                    value: 0,
                  };
                  acc[curr.Department].value++;
                  return acc;
                }, {})
              )}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {["#4F46E5", "#22C55E", "#F59E0B", "#EF4444"].map(
                (color, idx) => (
                  <Cell key={idx} fill={color} />
                )
              )}
            </Pie>
            <Tooltip />
          </PieChart>

          {/* Experience vs Salary */}
          <ScatterChart width={400} height={300}>
            <CartesianGrid />
            <XAxis type="number" dataKey="ExperienceYears" name="Experience" />
            <YAxis type="number" dataKey="Salary" name="Salary" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <Scatter name="Employees" data={cleanedData} fill="#4F46E5" />
          </ScatterChart>
        </div>
      )}
    </div>
  );
}
