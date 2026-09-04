import React from "react";
import "./footer.css";
import { assets } from "../../assets/frontend_assets/assets";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo} alt="logo" className="footer-logo" />
          <p>Fresh meals, made with care, delivered to your door in minutes</p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="Facebook" />
            <img src={assets.twitter_icon} alt="Twitter" />
            <img src={assets.linkedin_icon} alt="LinkedIn" />
          </div></div>

        <div className="footer-content-center">
          <h2>Company</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Menu</li>
            <li>Careers</li>
            <li>Privacy policy</li>
          </ul></div>

        <div className="footer-content-right" id="footer-contact">
          <h2>Get in Touch</h2>
          <ul>
            <li>+977 9762886552</li>
            <li>sushan1234@gmail.com</li>
            <li>Banepa-4, Kavre</li>
            <li>Mon - Sun: 9AM - 10PM</li>
          </ul></div>
      </div>

      <hr />
      <p className="footer-copyright">
        © 2026 Ugrachandi Food Delivery. All rights reserved.
      </p></div>
  );
};

export default Footer;
