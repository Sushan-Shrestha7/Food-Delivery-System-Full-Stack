import React, { useEffect, useRef, useState } from "react";
import "./AppDownload.css";
import { assets } from "../../assets/frontend_assets/assets";

const AppDownload = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }},
      { threshold: 0.3 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-download" id="app-download" ref={sectionRef}>
      <p className={isVisible ? "fade-in-up" : "hidden"}>
        Get the full experience — download our app today
      </p>
      <div className="app-download-platforms">
        <img src={assets.play_store} alt="play store" />
        <img src={assets.app_store} alt="app store" />
      </div></div>
  );
};

export default AppDownload;
