import React, { useState } from "react";
import "./Home.css";
import Header from "../../../components/Header/Header";
import Menu from "../../../components/ExploreMenu/menu";
import FoodDisplay from "../../../components/FoodDisplay/FoodDisplay";
import AppDownload from "../../../components/AppDowload/AppDownload";

const Home = () => {
  const [category, setcategory] = useState("All");
  return (
    <div className="home-page">
      <Header />
      <Menu category={category} setcategory={setcategory} />
      <FoodDisplay category={category} />
      <AppDownload />
    </div>);
};

export default Home;
