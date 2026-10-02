import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../../content/storeContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import "./AdminAnalytics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminAnalytics = () => {
  const { url, token } = useContext(StoreContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${url}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(res.data);
      } catch (err) {
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAnalytics();
  }, [url, token]);

  if (loading) return <div className="analytics-loading">Loading analytics...</div>;
  if (error) return <div className="analytics-error">{error}</div>;
  if (!analytics) return null;

  const {
    summary,
    ordersByStatus,
    ordersByPayment,
    revenueByDay,
    revenueByMonth,
    topItems,
    revenueByCategory,
  } = analytics;

  // Chart Data: Revenue by Day
  const revenueDayData = {
    labels: revenueByDay.map((d) => d.date),
    datasets: [
      {
        label: "Revenue (Rs)",
        data: revenueByDay.map((d) => d.revenue),
        borderColor: "#ff4d4d",
        backgroundColor: "rgba(255, 77, 77, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart Data: Orders by Status
  const orderStatusData = {
    labels: ["Placed", "Confirmed", "Out for Delivery", "Delivered", "Cancelled"],
    datasets: [
      {
        data: [
          ordersByStatus.placed,
          ordersByStatus.confirmed,
          ordersByStatus.out_for_delivery,
          ordersByStatus.delivered,
          ordersByStatus.cancelled,
        ],
        backgroundColor: ["#ffce56", "#36a2eb", "#9966ff", "#4bc0c0", "#ff6384"],
      },
    ],
  };

  // Chart Data: Top Selling Items
  const topItemsData = {
    labels: topItems.map((item) => item.name),
    datasets: [
      {
        label: "Quantity Sold",
        data: topItems.map((item) => item.quantity),
        backgroundColor: "#36a2eb",
      },
    ],
  };

  return (
    <div className="admin-analytics-container">
      <h2>Admin Dashboard Analytics</h2>
      
      {/* Charts Grid */}
      <div className="analytics-charts-grid">
        {/* Revenue Trend (Line Chart) */}
        <div className="chart-card large">
          <h3>Revenue Trend (Last 7 Days)</h3>
          <div className="chart-wrapper">
            <Line data={revenueDayData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Top Selling Items (Bar Chart) */}
        <div className="chart-card large">
          <h3>Top Selling Items</h3>
          <div className="chart-wrapper">
            <Bar data={topItemsData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
