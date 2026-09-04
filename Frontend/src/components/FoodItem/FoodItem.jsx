import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../../content/storeContext";
import { getRating, renderStars } from "../../utils/rating";

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);
  const rating = getRating(id);

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img
          className="food-item-image"
          src={image || assets.food_1}
          alt={name}
          onError={(e) => {
            if (e.currentTarget.src !== assets.food_1) {
              e.currentTarget.src = assets.food_1;
            }}}
        />

        {!cartItems[id] ? (
          <img
            className="add"
            onClick={() => addToCart(id)}
            src={assets.add_icon_white}
            alt="Add"
          />
        ) : (
          <div className="food-item-counter">
            <img
              onClick={() => removeFromCart(id)}
              src={assets.remove_icon_red}
              alt="Remove"
            />

            <p>{cartItems[id]}</p>

            <img
              onClick={() => addToCart(id)}
              src={assets.add_icon_green}
              alt="Add"
            />
          </div>)}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <span
            className="food-item-rating"
            style={{ color: "#ff8c42", fontSize: "14px", letterSpacing: "1px" }}
          >
            {renderStars(rating)}{" "}
            <span style={{ color: "#555", fontSize: "12px" }}>
              ({rating.toFixed(1)})
            </span></span>
        </div>

        <p className="food-item-desc">{description}</p>

        <p className="food-item-price">Rs {price}</p>
      </div></div>
  );
};

export default FoodItem;
