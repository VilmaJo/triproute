import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
const token = require("./mapbox.json");
const mapBoxToken = token.token;
mapboxgl.accessToken = mapBoxToken;

export default function Map() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(9.7);
    const [lat, setLat] = useState(53.35);
    const [zoom, setZoom] = useState(4);

    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/light-v10",
            center: [lng, lat],
            zoom: zoom,
        });
    });

    return (
        <div>
            <div ref={mapContainer} className="mapContainer"></div>
            <div className="mapInteractive">
                <button>Car</button>
                <button>Bicyle</button>
                <button>Kanu</button>
                <button>Sailing</button>
                <button>Hiking</button>
                <button>Climbing</button>
            </div>
        </div>
    );
}
