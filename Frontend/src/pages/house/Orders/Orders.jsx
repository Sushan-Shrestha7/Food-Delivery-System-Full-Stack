import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../../content/storeContext";
import "./Orders.css";

const Orders = () => {
  const { url, token } = useContext(StoreContext);
  const location = useLocation();
  const justPlacedOrder = location.state?.order;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${url}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        setError("Failed to load orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [url, token]);

  return (
    <div className="orders-page">
      {justPlacedOrder && (
        <div className="order-confirmation">
          <h2>🎉 Order Placed Successfully!</h2>
          <p>Order ID: {justPlacedOrder.id}</p>
          <p>Total: Rs{justPlacedOrder.totalAmount}</p>
          <p>Status: {justPlacedOrder.status}</p>
        </div>
      )}

      <h2 className="orders-title">Your Orders</h2>

      {loading && <p>Loading orders...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && orders.length === 0 && <p>You have no orders yet.</p>}

      <div className="orders-list">
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-card-header">
              <span>Order #{order.id}</span>
              <span className={`order-status status-${order.status}`}>
                {order.status}
              </span>
            </div>
            <p>Total: Rs{order.totalAmount}</p>
            <p>Placed: {new Date(order.placedAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
