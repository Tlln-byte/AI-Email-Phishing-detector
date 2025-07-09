// /components/EmailLogs/PieChart.jsx
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const PieChart = ({ logs }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const phishing = logs.filter((l) => l.prediction).length;
    const safe = logs.length - phishing;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Phishing", "Safe"],
        datasets: [
          {
            data: [phishing, safe],
            backgroundColor: ["#ff4d4d", "#00ffc3"],
            borderColor: "#161b22",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "#e0e0e0",
            },
          },
        },
      },
    });
  }, [logs]);

  return <canvas ref={canvasRef} />;
};

export default PieChart;
