import React, { useState, useContext, useEffect } from "react";
import "./login.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../../content/storeContext";
import axios from "axios";

// Use an env var so this works both locally and after deployment.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Login = ({ setShowLogin }) => {
  const { setToken } = useContext(StoreContext);
  const [currentState, setCurrentState] = useState("Log in"); // "Log in" | "Sign Up" | "OTP"
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [targetEmail, setTargetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setInfo("");
    setLoading(true);

    const isSignUp = currentState === "Sign Up";
    const url = isSignUp
      ? `${API_URL}/api/auth/signup`
      : `${API_URL}/api/auth/login`;

    const payload = isSignUp
      ? { name: data.name, email: data.email.trim(), password: data.password }
      : { email: data.email.trim(), password: data.password };

    try {
      const response = await axios.post(url, payload);

      if (isSignUp) {
        // Move to OTP verification step
        const activeEmail = response.data?.email || data.email.trim();
        setTargetEmail(activeEmail);
        setCurrentState("OTP");
        setOtp("");
        setResendTimer(30);
        setInfo(response.data?.message || `Verification code sent to ${activeEmail}`);
      } else {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setShowLogin(false);
      }
    } catch (err) {
      const responseData = err.response?.data;
      const message =
        responseData?.message || "Something went wrong. Please try again.";

      if (
        currentState === "Log in" &&
        responseData?.code === "EMAIL_NOT_VERIFIED"
      ) {
        const activeEmail = responseData.email || data.email.trim();
        setTargetEmail(activeEmail);
        setCurrentState("OTP");
        setOtp("");
        setResendTimer(30);
        setInfo(
          `Your email is not verified yet. We have sent a 6-digit verification code to ${activeEmail}.`
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtpHandler = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter a valid 6-digit OTP code.");
      return;
    }

    setError("");
    setInfo("");
    setLoading(true);

    const emailToVerify = targetEmail || data.email.trim();

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: emailToVerify,
        code: otp.trim(),
      });
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
      setShowLogin(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid or expired OTP. Please check and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const onResendOtpHandler = async () => {
    if (loading || resendTimer > 0) return;

    setError("");
    setInfo("");
    setLoading(true);

    const emailToResend = targetEmail || data.email.trim();

    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-otp`, {
        email: emailToResend,
      });
      setInfo(response.data?.message || `New verification code sent to ${emailToResend}`);
      setResendTimer(30);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend verification code.");
    } finally {
      setLoading(false);
    }
  };

  const switchState = (newState) => {
    if (loading) return;
    setCurrentState(newState);
    setError("");
    setInfo("");
    setOtp("");
  };

  return (
    <div className="login">
      <form
        className="login-container"
        onSubmit={currentState === "OTP" ? onVerifyOtpHandler : onSubmitHandler}
      >
        <div className="login-title">
          <h2>
            {currentState === "OTP"
              ? "Verify Email"
              : currentState === "Sign Up"
              ? "Create Account"
              : "Welcome Back"}
          </h2>

          <img
            src={assets.cross_icon}
            alt="Close"
            onClick={() => setShowLogin(false)}
          />
        </div>

        {currentState === "OTP" && (
          <div className="otp-info-banner">
            <p>
              We've sent a 6-digit verification code to:
              <br />
              <strong className="otp-target-email">{targetEmail || data.email}</strong>
            </p>
            <span
              className="otp-change-email-link"
              onClick={() => switchState("Sign Up")}
            >
              Wrong email? Edit
            </span>
          </div>
        )}

        <div className="login-inputs">
          {currentState === "Sign Up" && (
            <input
              name="name"
              type="text"
              placeholder="Your Full Name"
              value={data.name}
              onChange={onChangeHandler}
              required
              disabled={loading}
            />
          )}

          {currentState !== "OTP" && (
            <input
              name="email"
              type="email"
              placeholder="Your Email Address"
              value={data.email}
              onChange={onChangeHandler}
              required
              disabled={loading}
            />
          )}

          {currentState !== "OTP" && (
            <div className="password-field">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={data.password}
                onChange={onChangeHandler}
                required
                disabled={loading}
              />
              <img
                src={showPassword ? assets.eye_off_icon : assets.eye_icon}
                alt={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="password-toggle-icon"
              />
            </div>
          )}

          {currentState === "OTP" && (
            <div className="otp-input-group">
              <input
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                maxLength={6}
                required
                autoFocus
                disabled={loading}
                className="otp-field"
              />
            </div>
          )}
        </div>

        {info && <div className="auth-alert alert-success">{info}</div>}
        {error && <div className="auth-alert alert-error">{error}</div>}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading
            ? "Please wait..."
            : currentState === "Sign Up"
            ? "Create Account"
            : currentState === "OTP"
            ? "Verify & Continue"
            : "Sign In"}
        </button>

        {currentState === "OTP" && (
          <div className="otp-resend-section">
            <p>
              Didn't receive the code?{" "}
              {resendTimer > 0 ? (
                <span className="resend-countdown">Resend in {resendTimer}s</span>
              ) : (
                <span
                  className="resend-clickable"
                  onClick={onResendOtpHandler}
                >
                  Resend OTP
                </span>
              )}
            </p>
            <p className="otp-back-link" onClick={() => switchState("Log in")}>
              ← Back to Login
            </p>
          </div>
        )}

        {currentState !== "OTP" && (
          <div className="login-condition">
            <input type="checkbox" required />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
          </div>
        )}

        {currentState === "Log in" && (
          <p className="auth-toggle-prompt">
            Don't have an account?{" "}
            <span onClick={() => switchState("Sign Up")}>
              Create one here
            </span>
          </p>
        )}

        {currentState === "Sign Up" && (
          <p className="auth-toggle-prompt">
            Already have an account?{" "}
            <span onClick={() => switchState("Log in")}>
              Sign In here
            </span>
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
