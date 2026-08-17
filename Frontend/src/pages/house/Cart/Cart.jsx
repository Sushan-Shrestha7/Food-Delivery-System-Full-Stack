import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./Cart.css";
import { StoreContext } from "../../../content/storeContext";
import { useNavigate } from "react-router-dom";
import { imageMap } from "../../../utils/imageMap";

const Cart = () => {
  const { url, token, removeFromCart } = useContext(StoreContext);
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [] });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutError, setCheckoutError] = useState("");

  const fetchCart = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${url}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data.cart);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [url, token]);

  const deliveryFee = total === 0 ? 0 : 100;
  const grandTotal = total === 0 ? 0 : total + deliveryFee;

  const handleRemove = async (productId) => {
    await removeFromCart(productId);
    fetchCart();
  };

  const handleCheckout = () => {
    if (!cart.items || cart.items.length === 0) {
      setCheckoutError("Your cart is empty. Add items before checking out.");
      return;
    }
    navigate("/order");
  };

  if (loading) return <div className="cart">Loading cart...</div>;

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>

        <hr />

        {cart.items && cart.items.length > 0 ? (
          cart.items.map((item) => (
            <div key={item.id}>
              <div className="cart-items-title cart-items-item">
                <img
                  src={imageMap[item.product?.imageUrl]}
                  alt={item.product?.name}
                />
                <p>{item.product?.name}</p>
                <p>Rs{item.priceAtAdd}</p>
                <p>{item.quantity}</p>
                <p>Rs{item.priceAtAdd * item.quantity}</p>
                <p
                  className="cross"
                  onClick={() => handleRemove(item.productId)}
                >
                  ×
                </p>
              </div>
              <hr />
            </div>
          ))
        ) : (
          <p className="empty-cart-text">Your cart is empty.</p>
        )}
      </div>

      <div className="cart-bottom">
        <div className="cart-totals">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-totals-details">
              <p>Subtotal</p>
              <p>Rs{total}</p>
            </div>
            <hr />
            <div className="cart-totals-details">
              <p>Delivery Fee</p>
              <p>Rs{deliveryFee}</p>
            </div>
            <hr />
            <div className="cart-totals-details">
              <b>Total</b>
              <b>Rs{grandTotal}</b>
            </div>
          </div>

          {checkoutError && <p className="error-text">{checkoutError}</p>}

          <button
            onClick={handleCheckout}
            disabled={!cart.items || cart.items.length === 0}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="promo code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
