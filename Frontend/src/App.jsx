import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/footer";
import Login from "./components/login/login";
import Home from "./pages/house/Home/Home";
import Cart from "./pages/house/Cart/Cart";
import PlaceOrder from "./pages/house/Cart/PlaceOrder/PlaceOrder";
import Orders from "./pages/house/Orders/Orders";
import ChatWidget from "./components/ChatWidget/ChatWidget";
import AdminLogin from "./pages/house/Admin/AdminLogin";
import AddItem from "./pages/house/Admin/AdminItem";
import ProtectedAdminRoute from "./pages/house/Admin/ProtectedAdminRoute";
import PaymentSuccess from "./pages/house/Cart/PlaceOrder/PaymentSuccess";
import PaymentFailure from "./pages/house/Cart/PlaceOrder/PaymentFailure";


const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {showLogin && <Login setShowLogin={setShowLogin} />}

      <div className="App">
        <Navbar setShowLogin={setShowLogin} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/add-item"
            element={
              <ProtectedAdminRoute>
                <AddItem />
              </ProtectedAdminRoute>
            }
          />
        </Routes></div>

      <Footer />
      <ChatWidget />
    </>
  );
};

export default App;
