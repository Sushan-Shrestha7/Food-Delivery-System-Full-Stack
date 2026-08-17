import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Banepa municipality bounding box (approx). Tighten/adjust as needed.
const BANEPA_BOUNDS = [
  [27.615, 85.51], // SW corner
  [27.66, 85.545], // NE corner
];
const BANEPA_CENTER = [27.6357, 85.522];

// onLocationSelect receives: { line1, line2, district, province, lat, lng }
export default function BanepaLocationPicker({ onLocationSelect }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const map = L.map(mapRef.current, {
      center: BANEPA_CENTER,
      zoom: 15,
      minZoom: 14,
      maxBounds: BANEPA_BOUNDS,
      maxBoundsViscosity: 1.0, // hard-locks panning to Banepa only
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    map.setMaxBounds(BANEPA_BOUNDS);
    map.fitBounds(BANEPA_BOUNDS);

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) map.removeLayer(markerRef.current);
      markerRef.current = L.marker([lat, lng]).addTo(map);

      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { "Accept-Language": "en" } },
        );
        const data = await res.json();
        const addr = data.address || {};

        // Map Nominatim fields -> PlaceOrder.jsx's data state fields
        const line1 =
          addr.road || addr.neighbourhood || addr.suburb || data.display_name;
        const line2 = addr.suburb || addr.city_district || "";
        const district = addr.county || addr.state_district || "Kavre";
        const province = "Bagmati"; // fixed, since bounds are locked to Banepa/Kavre

        onLocationSelect({
          line1,
          line2,
          district,
          province,
          lat,
          lng,
        });
      } catch (err) {
        console.error("Reverse geocode failed:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => map.remove();
  }, [onLocationSelect]);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={mapRef}
        style={{ height: "350px", width: "100%", borderRadius: 8 }}
      />
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "#fff",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          Locating...
        </div>
      )}
    </div>
  );
}
