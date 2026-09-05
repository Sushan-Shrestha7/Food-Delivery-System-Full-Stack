import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./BanepaLocationPicker.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const BANEPA_BOUNDS = [
  [27.610, 85.495],
  [27.665, 85.555],
];
const BANEPA_CENTER = [27.632, 85.524];

const createCustomPinIcon = () =>
  L.divIcon({
    className: "banepa-custom-pin",
    html: `
      <div class="banepa-marker-container">
        <svg class="banepa-marker-pin" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.06 0 0 8.06 0 18C0 31.5 18 44 18 44C18 44 36 31.5 36 18C36 8.06 27.94 0 18 0Z" fill="#ff4c24"/>
          <circle cx="18" cy="17" r="7" fill="#ffffff"/>
          <circle cx="18" cy="17" r="4" fill="#ff4c24"/>
        </svg>
        <div class="banepa-marker-pulse"></div>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });

export default function BanepaLocationPicker({ onLocationSelect }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: BANEPA_CENTER,
      zoom: 15,
      minZoom: 13,
      maxZoom: 18,
      maxBounds: BANEPA_BOUNDS,
      maxBoundsViscosity: 0.8,
    });
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const updateLocation = async (lat, lng) => {
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], {
          icon: createCustomPinIcon(),
          draggable: true,
        }).addTo(map);

        markerRef.current.on("dragend", (event) => {
          const newPos = event.target.getLatLng();
          updateLocation(newPos.lat, newPos.lng);
        });
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }

      markerRef.current
        .bindPopup(
          `<div style="font-size: 13px; font-family: sans-serif; min-width: 130px;">
            <strong style="color: #ff4c24;">📍 Marked Location</strong><br/>
            <span style="color: #666;">Locating address...</span>
          </div>`
        )
        .openPopup();

      setLoading(true);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        const addr = data.address || {};

        const line1 =
          addr.road ||
          addr.neighbourhood ||
          addr.suburb ||
          addr.hamlet ||
          addr.village ||
          addr.town ||
          (data.display_name ? data.display_name.split(",")[0] : "Banepa");
        const line2 = addr.suburb || addr.city_district || addr.neighbourhood || "";
        const district = addr.county || addr.state_district || "Kavre";
        const province = "Bagmati";

        const label = `${line1}${line2 ? `, ${line2}` : ""}`;
        setSelectedAddress(label);

        if (markerRef.current) {
          markerRef.current
            .bindPopup(
              `<div style="font-size: 13px; font-family: sans-serif; line-height: 1.4;">
                <strong style="color: #ff4c24;">📍 Delivery Point</strong><br/>
                <b>${line1}</b>
                ${line2 ? `<br/><span style="color: #555; font-size: 12px;">${line2}</span>` : ""}
                <br/><span style="color: #888; font-size: 11px;">(Drag marker anytime to adjust)</span>
              </div>`
            )
            .openPopup();
        }

        if (onLocationSelectRef.current) {
          onLocationSelectRef.current({
            line1,
            line2,
            district,
            province,
            lat,
            lng,
          });
        }
      } catch (err) {
        console.error("Reverse geocode failed:", err);
        setSelectedAddress(`Banepa (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        if (markerRef.current) {
          markerRef.current
            .bindPopup(
              `<div style="font-size: 13px; font-family: sans-serif;">
                <strong style="color: #ff4c24;">📍 Delivery Point</strong><br/>
                <span>Banepa (${lat.toFixed(4)}, ${lng.toFixed(4)})</span>
              </div>`
            )
            .openPopup();
        }
        if (onLocationSelectRef.current) {
          onLocationSelectRef.current({
            line1: "Banepa",
            line2: "",
            district: "Kavre",
            province: "Bagmati",
            lat,
            lng,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      updateLocation(lat, lng);
    });

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
    };
  }, []);

  return (
    <div className="banepa-picker-container">
      <div className="banepa-picker-header">
        <div className="banepa-picker-title">
          <span className="picker-icon">📍</span>
          <span>Banepa Delivery Location</span>
        </div>
        {loading && <span className="banepa-loading-badge">Locating address...</span>}
      </div>

      <div className="banepa-map-wrapper">
        <div ref={mapContainerRef} className="banepa-map-frame" />
      </div>

      <div className="banepa-picker-footer">
        {selectedAddress ? (
          <div className="banepa-selected-info">
            <span className="check-icon">✓</span>
            <span>
              Marked: <strong>{selectedAddress}</strong>
            </span>
          </div>
        ) : (
          <div className="banepa-hint-info">
            <span>👆 Click anywhere on the Banepa map to clearly mark your delivery spot.</span>
          </div>
        )}
      </div>
    </div>
  );
}
