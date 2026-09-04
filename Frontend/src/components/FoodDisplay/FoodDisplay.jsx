import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./FoodDisplay.css";
import { StoreContext } from "../../content/storeContext";
import FoodItem from "../FoodItem/FoodItem";
import { imageMap } from "../../utils/imageMap";

const FoodDisplay = ({ category }) => {
  const { url, searchQuery } = useContext(StoreContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${url}/api/products`);
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to load products", err);
      }};
    fetchProducts();
  }, [url]);

  let visibleItems =
    category === "All"
      ? products
      : products.filter((item) => item.category === category);

  if (searchQuery && searchQuery.trim() !== "") {
    visibleItems = visibleItems.filter((item) =>
      item.name.toLowerCase().startsWith(searchQuery.toLowerCase()),
    );
  }

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>
      <div className="food-display-list">
        {visibleItems.map((item) => (
          <FoodItem
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={imageMap[item.imageUrl]}
          />
        ))}
      </div></div>
  );
};

export default FoodDisplay;
