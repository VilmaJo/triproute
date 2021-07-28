import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import mapboxgl from "mapbox-gl";

// mapbox-styles
import "mapbox-gl/dist/mapbox-gl.css";

import axios from "../axios";

const token = require("./mapbox.json");
const styles = require("../mapdata/styles.json");
const mapBoxToken = token.token;
mapboxgl.accessToken = mapBoxToken;

export default function Map() {
    // const dispatch = useDispatch();
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(9.7);
    const [lat, setLat] = useState(53.35);
    const [zoom, setZoom] = useState(4);
    const [basicLayer, setBasicLayer] = useState("");
    const [geomFeatures, setGeomFeatures] = useState();

    useEffect(() => {
        axios.get("/api/geom").then((response) => {
            console.log("map api/geom ", response.data[1]);
            return setGeomFeatures(response.data);
        });
    }, []);

    useEffect(() => {
        if (map.current) return; // initialize map only once

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/light-v10",
            center: [lng, lat],
            zoom: zoom,
        });

        map.current.on("move", () => {
            setLng(map.current.getCenter().lng.toFixed(zoom));
            setLat(map.current.getCenter().lat.toFixed(zoom));
            setZoom(map.current.getZoom().toFixed(2));
        });
    }, []);

    // console.log("geomFeatures", geomFeatures);
    //map.addSource(geomFeatures);

    function onRadioClick(event) {
        // setBasicLayer(styles[event.target.value]);
        console.log(
            "onRadioClick",
            event.target.value,
            geomFeatures.data.features[0].geometry.coordinates
        );
    }

    function onButtonClick() {
        map.current.addSource("bus-routes", {
            type: "geojson",
            data: "https://opendata.arcgis.com/datasets/4347f3565fbe4d5dbb97b016768b8907_0.geojson",
        });

        map.current.addLayer({
            id: "bus-routes-line",
            type: "line",
            source: "bus-routes",
            paint: {
                "line-color": "#cc0909",
                "line-width": 4,
            },
        });
    }

    function onButtonCycleClick() {
        //geomFeatures.data.features[0].geometry.coordinates
        console.log("onButtonClick", geomFeatures);
        map.current.addSource("trips", {
            type: "geojson",
            data: geomFeatures.data.features[0],
        });

        map.current.addLayer({
            id: "trips-around",
            type: "line",
            source: "trips",
            paint: {
                "line-color": "#15cc09",
                "line-width": 14,
            },
        });
    }

    return (
        <div>
            <div ref={mapContainer} className="mapContainer"></div>

            <div className="mapInteractive">
                <p>
                    Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
                </p>

                <button onClick={onButtonClick}>Car</button>
                <button onClick={onButtonCycleClick}>Bicyle</button>
                <button>Kanu</button>
                <button>Sailing</button>
                <button>Hiking</button>
                <button>Climbing</button>
                <div className="basicLayer">
                    <input
                        type="radio"
                        value="Mapbox Streets"
                        name="basiclayer"
                        onClick={onRadioClick}
                    />
                    Streets
                    <input
                        type="radio"
                        value="Mapbox Outdoors"
                        name="basiclayer"
                        onClick={onRadioClick}
                    />
                    Outdoors
                    <input
                        type="radio"
                        value="Mapbox Light"
                        name="basiclayer"
                        onClick={onRadioClick}
                    />
                    Light
                    <input type="radio" value="Mapbox Dark" name="basiclayer" />
                    Dark
                    <input
                        type="radio"
                        value="Mapbox Satellite"
                        name="basiclayer"
                        onClick={onRadioClick}
                    />
                    Satellite
                    <input
                        type="radio"
                        value="Mapbox Satellite Streets"
                        name="basiclayer"
                        onClick={onRadioClick}
                    />
                    Satellite Streets
                    <input
                        type="radio"
                        value="Mapbox Navigation Day"
                        name="basiclayer"
                        onClick={onRadioClick}
                    />
                    Navigation Day
                    <input
                        type="radio"
                        value="Mapbox Navigation Night"
                        name="basiclayer"
                        onClick={onRadioClick}
                    />
                    Navigation Night
                </div>
            </div>
        </div>
    );
}
