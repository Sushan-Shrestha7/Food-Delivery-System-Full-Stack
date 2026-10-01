import React from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentFailure.css";

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="failure-page">
      <div className="failure-card">
        {/* Animated X icon */}
        <div className="failure-icon-wrapper">
          <svg className="failure-x" viewBox="0 0 52 52">
            <circle className="failure-circle" cx="26" cy="26" r="25" fill="none" />
            <path
              className="failure-cross"
              fill="none"
              d="M16 16 L36 36 M36 16 L16 36"
            />
          </svg>
        </div>

        <h2>Payment Failed</h2>
        <p className="failure-sub">
          Your eSewa payment was not completed or was cancelled.
          <br />
          No money has been deducted from your account.
        </p>

        <div className="failure-tips">
          <p>💡 <strong>Common reasons:</strong></p>
          <ul>
            <li>Insufficient eSewa balance</li>
            <li>Incorrect MPIN or OTP</li>
            <li>Session timed out</li>
            <li>Payment was cancelled by you</li>
          </ul>
        </div>

        <div className="failure-actions">
          <button
            id="failure-retry-btn"
            className="failure-btn-retry"
            onClick={() => navigate("/order")}
          >
            ↩ Try Again
          </button>
          <button
            id="failure-home-btn"
            className="failure-btn-outline"
            onClick={() => navigate("/")}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
