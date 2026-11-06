import React from "react";
import { Line } from "react-chartjs-2";

export function TransactionChart({ usertransactions }) {
 
  const chartData = {
    labels: usertransactions.map((tx) => 
      tx.transactiondate ? tx.transactiondate.split("T")[0] : ""
    ),
    datasets: [
      {
        label: "Transaction Amount ($)",
        data: usertransactions.map((tx) => Number(tx.amount || 0)),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Transactions Over Time",
      },
      legend: {
        display: false,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "250px" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}