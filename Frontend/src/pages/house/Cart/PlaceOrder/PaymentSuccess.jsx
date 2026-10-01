import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./PaymentSuccess.css";

const BACKEND_URL = "http://localhost:5000";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [order, setOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const verified = useRef(false);

  useEffect(() => {
    if (verified.current) return;
    verified.current = true;

    const verify = async () => {
      try {
        const encodedData = searchParams.get("data");
        if (!encodedData) {
          setStatus("error");
          setErrorMsg("No payment data received from eSewa.");
          return;
        }

        // Retrieve delivery info saved before redirect
        const saved = sessionStorage.getItem("esewa_delivery");
        if (!saved) {
          setStatus("error");
          setErrorMsg("Session expired. Please try again.");
          return;
        }

        const { deliveryAddress, token } = JSON.parse(saved);

        const res = await axios.post(
          `${BACKEND_URL}/api/esewa/verify`,
          { encodedData, deliveryAddress },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        sessionStorage.removeItem("esewa_delivery");
        setOrder(res.data.order);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setErrorMsg(
          err.response?.data?.message ||
            "Payment verification failed. Please contact support."
        );
      }
    };

    verify();
  }, [searchParams]);

  const handleGoToOrders = () => navigate("/orders");
  const handleGoHome = () => navigate("/");

  if (status === "verifying") {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <div className="spinner-ring" />
          <h2>Verifying Payment...</h2>
          <p>Please wait while we confirm your eSewa payment.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="payment-page">
        <div className="payment-card error-card">
          <div className="payment-icon error-icon">✕</div>
          <h2>Verification Failed</h2>
          <p className="payment-sub">{errorMsg}</p>
          <div className="payment-actions">
            <button className="btn-outline" onClick={() => navigate("/order")}>
              Try Again
            </button>
            <button className="btn-primary" onClick={handleGoHome}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-card success-card">
        {/* Animated checkmark */}
        <div className="checkmark-wrapper">
          <svg className="checkmark" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14 27l8 8 16-16" />
          </svg>
        </div>

        <h2 className="success-title">Payment Successful!</h2>
        <p className="payment-sub">
          Your eSewa payment was confirmed and your order has been placed.
        </p>

        {order && (
          <div className="order-summary-box">
            <div className="order-summary-row">
              <span>Order ID</span>
              <span className="order-id-chip">{order.id?.slice(0, 8)}…</span>
            </div>
            <div className="order-summary-row">
              <span>Amount Paid</span>
              <span className="amount-chip">Rs {order.totalAmount}</span>
            </div>
            <div className="order-summary-row">
              <span>Payment</span>
              <span className="esewa-badge">eSewa ✓</span>
            </div>
            <div className="order-summary-row">
              <span>Status</span>
              <span className="status-chip">Placed</span>
            </div>
          </div>
        )}

        <div className="confetti-container">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                background: ["#60bb46", "#ffd700", "#ff6b6b", "#4ecdc4", "#a8e063"][
                  i % 5
                ],
              }}
            />
          ))}
        </div>

        <div className="payment-actions">
          <button className="btn-outline" onClick={handleGoHome}>
            Continue Shopping
          </button>
          <button className="btn-primary esewa-btn" onClick={handleGoToOrders}>
            View My Orders →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
