import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PlaceOrder.css";
import { StoreContext } from "../../../../content/storeContext";
import BanepaLocationPicker from "./BanepaLocationPicker";

const NEPAL_PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

const PlaceOrder = () => {
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    line1: "",
    line2: "",
    district: "",
    province: "Bagmati",
    landmark: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cartTotal, setCartTotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${url}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartTotal(res.data.total || 0);
      } catch (err) {
        console.error("Failed to load cart totals", err);
      } finally {
        setCartLoading(false);
      }};
    fetchCart();
  }, [url, token]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };


  const onMapLocationSelect = ({ line1, line2, district, province }) => {
    setData((prev) => ({
      ...prev,
      line1: line1 ?? prev.line1,
      line2: line2 ?? prev.line2,
      district: district ?? prev.district,
      province: province ?? prev.province,
    }));
  };

  const isValidNepaliPhone = (phone) => /^(97|98)\d{8}$/.test(phone);

  const deliveryFee = cartTotal === 0 ? 0 : 50;
  const grandTotal = cartTotal === 0 ? 0 : cartTotal + deliveryFee;

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!isValidNepaliPhone(data.phone)) {
      setError("Please enter a valid Nepali mobile number (e.g. 98XXXXXXXX)");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        deliveryAddress: {
          line1: data.line1,
          line2: data.line2 || undefined,
          city: data.district,
          state: data.province,
          postalCode: "00000",
          country: "Nepal",
          phone: data.phone,
        },
        paymentMethod,
      };

      const res = await axios.post(`${url}/api/orders/place`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage("🎉 Order placed successfully! Redirecting...");

      setTimeout(() => {
        navigate("/orders", { state: { order: res.data.order } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
      setLoading(false);
    }};

  return (
    <form className="place-order" onSubmit={onSubmitHandler}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>

        {error && <p className="error-text">{error}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>}

        {}
        <BanepaLocationPicker onLocationSelect={onMapLocationSelect} />

        <input
          name="line1"
          onChange={onChangeHandler}
          value={data.line1}
          type="text"
          placeholder="Tole / Street address"
          required
        />
        <input
          name="line2"
          onChange={onChangeHandler}
          value={data.line2}
          type="text"
          placeholder="Ward no. / Area (optional)"
        />

        <div className="multi-fields">
          <input
            name="district"
            onChange={onChangeHandler}
            value={data.district}
            type="text"
            placeholder="District (e.g. Kavre)"
            required
          />
          <select
            name="province"
            value={data.province}
            onChange={onChangeHandler}
            className="payment-method"
          >
            {NEPAL_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>))}
          </select></div>

        <input
          name="landmark"
          onChange={onChangeHandler}
          value={data.landmark}
          type="text"
          placeholder="Nearby landmark (optional)"
        />

        <input
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          type="tel"
          placeholder="98XXXXXXXX"
          maxLength={10}
          required
        />

        <select
          className="payment-method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="cod">Cash on Delivery</option>
          <option value="card">Card</option>
          <option value="wallet">Wallet</option>
        </select></div>

      <div className="place-order-right">
        <div className="cart-totals">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-totals-details">
              <p>Subtotal</p>
              <p>{cartLoading ? "..." : `Rs${cartTotal}`}</p>
            </div>
            <hr />
            <div className="cart-totals-details">
              <p>Delivery Fee</p>
              <p>{cartLoading ? "..." : `Rs${deliveryFee}`}</p>
            </div>
            <hr />
            <div className="cart-totals-details">
              <b>Total</b>
              <b>{cartLoading ? "..." : `Rs${grandTotal}`}</b>
            </div></div>
          <button type="submit" disabled={loading || cartLoading}>
            {loading ? "PLACING ORDER..." : "PROCEED TO PAYMENT"}
          </button></div>
      </div></form>
  );
};

export default PlaceOrder;
