import React from "react";
import "./menu.css";
import { menu_list } from "../../assets/frontend_assets/assets";
const Menu = ({ category, setcategory }) => {
  return (
    <div className="menu" id="menu">
      <h1>Explore our menu</h1>
      <p className="explore-menu-text">Choose from a diverse </p>
      <div className="explore-menu-list">
        {menu_list.map((item, index) => {
          return (
            <div
              onClick={() =>
                setcategory((prev) =>
                  prev === item.menu_name ? "All" : item.menu_name,
                )
              }
              key={index}
              className="explore-menu-item"
            >
              <img
                className={category === item.menu_name ? "active" : ""}
                src={item.menu_image}
                alt=""
              />
              <p>{item.menu_name}</p>
            </div>);
        })}
      </div>
      <hr />
    </div>);
};

export default Menu;
