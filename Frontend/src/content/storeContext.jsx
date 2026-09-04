import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { food_list } from "../assets/frontend_assets/assets";

export const StoreContext = createContext(null);

const url = "http://localhost:5000";

const parseJwt = (tok) => {
  if (!tok) return null;
  try {
    const base64Url = tok.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }};

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [searchQuery, setSearchQuery] = useState("");

  const user = parseJwt(token);
  const isAdmin = user?.role === "admin";

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const loadCart = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${url}/api/cart`, authHeaders());
      const items = {};
      for (const item of res.data.cart.items) {
        items[item.productId] = item.quantity;
      }
      setCartItems(items);
    } catch (err) {
      console.error("Failed to load cart", err);
    }};

  const addToCart = async (itemId) => {
    if (!token) {
      alert("Please sign in to add items to your cart");
      return;
    }
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    try {
      await axios.post(
        `${url}/api/cart/add`,
        { productId: itemId, quantity: 1 },
        authHeaders(),
      );
    } catch (err) {
      console.error("Failed to add to cart", err);
      loadCart();
    }};

  const removeFromCart = async (itemId) => {
    if (!token) return;
    const newQty = (cartItems[itemId] || 0) - 1;
    setCartItems((prev) => ({ ...prev, [itemId]: Math.max(newQty, 0) }));
    try {
      if (newQty <= 0) {
        await axios.delete(
          `${url}/api/cart/remove/${Number(itemId)}`,
          authHeaders(),
        );
      } else {
        await axios.put(
          `${url}/api/cart/update`,
          { productId: Number(itemId), quantity: newQty },
          authHeaders(),
        );
      }} catch (err) {
      console.error("Failed to update cart", err);
      loadCart();
    }};

  const clearCart = async () => {
    setCartItems({});
    if (!token) return;
    try {
      await axios.delete(`${url}/api/cart/clear`, authHeaders());
    } catch (err) {
      console.error("Failed to clear cart", err);
    }};

  useEffect(() => {
    if (token) {
      loadCart();
    }}, [token]);

  const contextValue = {
    url,
    token,
    setToken,
    user,
    isAdmin,
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    clearCart,
    loadCart,
    searchQuery,
    setSearchQuery,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
