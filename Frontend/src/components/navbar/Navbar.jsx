import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../../content/storeContext";
import { imageMap } from "../../utils/imageMap";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("HOME");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  const {
    token,
    setToken,
    isAdmin,
    cartItems,
    clearCart,
    url,
    searchQuery,
    setSearchQuery,
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${url}/api/products`);
        setAllProducts(res.data);
      } catch (err) {
        console.error("Failed to load products for search", err);
      }};
    fetchProducts();
  }, [url]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    clearCart();
    setShowProfileMenu(false);
    navigate("/");
  };

  const hasCartItems = Object.values(cartItems).some((qty) => qty > 0);

  const scrollToSection = (sectionId, menuName) => {
    setMenu(menuName);
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    setMenu("HOME");
    if (window.location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }};

  const handleSearchIconClick = () => {
    setShowSearch((prev) => !prev);
    if (showSearch) {
      setSearchQuery("");
    }};

  const searchResults =
    searchQuery && searchQuery.trim() !== ""
      ? allProducts.filter((item) =>
        item.name.toLowerCase().startsWith(searchQuery.toLowerCase()),
      )
      : [];

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="navbar-logo" />
      </Link>

      <ul className="navbar-links">
        <li className={menu === "HOME" ? "active" : ""} onClick={scrollToTop}>
          Home
        </li>
        <li
          className={menu === "MENU" ? "active" : ""}
          onClick={() => scrollToSection("food-display", "MENU")}
        >
          Menu
        </li>
        <li
          className={menu === "ABOUT" ? "active" : ""}
          onClick={() => scrollToSection("footer", "ABOUT")}
        >
          About
        </li>
        <li
          className={menu === "CONTACT" ? "active" : ""}
          onClick={() => scrollToSection("footer-contact", "CONTACT")}
        >
          Contact
        </li>
        {isAdmin && (
          <li
            className={
              location.pathname.startsWith("/admin")
                ? "active admin-nav-link"
                : "admin-nav-link"
            }
            onClick={() => {
              setMenu("ADMIN");
              navigate("/admin/add-item");
            }}
          >
            Add Item
          </li>)}
      </ul>

      <div className="navbar-right">
        {isAdmin && (
          <button
            className="navbar-admin-btn"
            onClick={() => {
              setMenu("ADMIN");
              navigate("/admin/add-item");
            }}
            title="Admin - Add and Manage Items"
          >
            + Add Item
          </button>)}

        <div className="navbar-search-wrapper">
          {showSearch && (
            <>
              <input
                type="text"
                className="navbar-search-input"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery.trim() !== "" && (
                <div className="search-results-dropdown">
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <div
                        key={item.id}
                        className="search-result-item"
                        onClick={() => {
                          setSearchQuery("");
                          setShowSearch(false);
                          scrollToSection("food-display", "MENU");
                        }}
                      >
                        <img
                          src={imageMap[item.imageUrl] || assets.food_1}
                          alt={item.name}
                          onError={(e) => {
                            if (e.currentTarget.src !== assets.food_1) {
                              e.currentTarget.src = assets.food_1;
                            }}}
                        />
                        <div className="search-result-info">
                          <p className="search-result-name">{item.name}</p>
                          <p className="search-result-price">Rs{item.price}</p>
                        </div></div>
                    ))
                  ) : (
                    <p className="search-no-results">No dishes found</p>
                  )}
                </div>)}
            </>
          )}
          <img
            src={assets.search_icon}
            alt="Search"
            className="navbar-icon"
            onClick={handleSearchIconClick}
          />
        </div>

        <Link to="/cart" className="navbar-search-icon">
          <img src={assets.basket_icon} alt="Basket" className="navbar-icon" />
          {hasCartItems && <div className="dot"></div>}
        </Link>

        {!token ? (
          <button className="navbar-sign-in" onClick={() => setShowLogin(true)}>
            Sign In
          </button>) : (
          <div className="navbar-profile">
            <img
              src={assets.profile_icon}
              alt="Profile"
              className="navbar-profile-icon"
              onClick={() => setShowProfileMenu((prev) => !prev)}
            />
            {showProfileMenu && (
              <ul className="navbar-profile-dropdown">
                {isAdmin && (
                  <>
                    <li
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/admin/add-item");
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>⚙️</span>
                      <p>Admin Items</p>
                    </li>
                    <hr />
                  </>
                )}
                <li onClick={() => navigate("/orders")}>
                  <img src={assets.bag_icon} alt="Orders" />
                  <p>Orders</p>
                </li>
                <hr />
                <li onClick={logout}>
                  <img src={assets.logout_icon} alt="Logout" />
                  <p>Logout</p>
                </li></ul>
            )}
          </div>)}
      </div></div>
  );
};

export default Navbar;
