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

  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");

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

  const handleCancelClick = (orderId) => {
    setCancellingOrderId(orderId);
    setCancelReason("");
    setCancelError("");
  };

  const submitCancel = async () => {
    if (!cancelReason) {
      setCancelError("Please select a reason");
      return;
    }
    try {
      const res = await axios.patch(
        `${url}/api/orders/${cancellingOrderId}/cancel`,
        { reason: cancelReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(
        orders.map((o) =>
          o.id === cancellingOrderId ? { ...o, status: "cancelled", cancellationReason: cancelReason } : o
        )
      );
      setCancellingOrderId(null);
    } catch (err) {
      setCancelError(err.response?.data?.message || "Cancellation unavailable");
    }
  };

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
        {orders.map((order) => {
          const CANCEL_TIME_LIMIT_MINUTES = 1;
          const orderAgeMinutes = (new Date() - new Date(order.placedAt)) / (1000 * 60);
          const canCancel = 
            (order.status === "placed" || order.status === "confirmed") && 
            orderAgeMinutes <= CANCEL_TIME_LIMIT_MINUTES;

          return (
            <div className="order-card" key={order.id}>
              <div className="order-card-header">
                <span>Order #{order.id}</span>
                <span className={`order-status status-${order.status}`}>
                  {order.status}
                </span>
              </div>
              <p>Total: Rs{order.totalAmount}</p>
              <p>Placed: {new Date(order.placedAt).toLocaleString()}</p>
              
              {canCancel && cancellingOrderId !== order.id && (
                <button 
                  className="cancel-btn" 
                  onClick={() => handleCancelClick(order.id)}
                >
                  Cancel Order
                </button>
              )}

              {cancellingOrderId === order.id && (
                <div className="cancel-modal">
                  <p>Why do you want to cancel?</p>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  >
                    <option value="">Select a reason</option>
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Taking too long">Taking too long</option>
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Wrong address">Wrong address</option>
                    <option value="Other">Other</option>
                  </select>
                  {cancelError && <p className="error-text">{cancelError}</p>}
                  <div className="cancel-actions">
                    <button onClick={submitCancel} className="confirm-cancel-btn">
                      Confirm Cancel
                    </button>
                    <button
                      onClick={() => setCancellingOrderId(null)}
                      className="keep-order-btn"
                    >
                      Keep Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
