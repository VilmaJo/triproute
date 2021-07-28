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
    const [basicLayer, setBasicLayer] = useState();
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
            style: "mapbox://styles/mapbox/streets-v11",
            center: [lng, lat],
            zoom: zoom,
        });
    }, []);

    useEffect(() => {
        console.log("useEffect basicLayer", basicLayer);
        if (!basicLayer) {
            return;
        }
        map.current.setStyle(basicLayer);

        map.current.on("move", () => {
            setLng(map.current.getCenter().lng.toFixed(zoom));
            setLat(map.current.getCenter().lat.toFixed(zoom));
            setZoom(map.current.getZoom().toFixed(2));
        });

        map.current.on("click", (event) => {
            // console.log(
            //     "onMapClick event",
            //     event.lngLat.wrap(),
            //     event.lngLat.lng,
            //     event.lngLat.lat
            // );
        });
    }, [basicLayer]);

    // console.log("geomFeatures", geomFeatures);
    //map.addSource(geomFeatures);

    function onRadioClick(event) {
        let value = event.target.value;

        styles.map((style) => {
            if (style[value]) {
                // console.log("TruE", style[value]);
                setBasicLayer(style[value]);
                return;
            }
        });
        // console.log("onRadioClick basicLayer", basicLayer);
    }

    function onButtonLinestringClick() {
        // MULTILINES MULTILINES MULTILINES MULTILINES MULTILINES
        console.log("linestring", geomFeatures.LINESTRING);
        map.current.addSource("lines", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: geomFeatures.LINESTRING,
            },
        });

        map.current.addLayer({
            id: "linestring",
            type: "line",
            source: "lines",
            paint: {
                "line-color": "#cc0909",
                "line-width": 4,
            },
        });
    }

    function onButtonLineClick() {
        // LINES LINES LINES LINES LINES
        console.log("onButtonClick", geomFeatures);
        map.current.addSource("line", {
            type: "geojson",
            data: {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: geomFeatures.LINES,
                },
            },
        });

        map.current.addLayer({
            id: "line",
            type: "line",
            source: "line",
            paint: {
                "line-color": "#e3a1a1",
                "line-width": 3,
            },
        });
    }

    function onButtonPointClick() {
        // POINTS POINTS POINTS
        map.current.addSource("points", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: geomFeatures.POINTS,
            },
        });

        map.current.addLayer({
            id: "points",
            type: "circle",
            source: "points",
            paint: {
                "circle-radius": 5,
                "circle-color": "rgb(185, 212, 218)",
            },
        });
    }

    return (
        <div>
            <div ref={mapContainer} className="mapContainer">
                <div className="basicLayer">
                    <p>
                        <input
                            type="radio"
                            value="Streets"
                            name="basiclayer"
                            onClick={onRadioClick}
                        />
                        Streets
                    </p>
                    <p>
                        <input
                            type="radio"
                            value="Outdoors"
                            name="basiclayer"
                            onClick={onRadioClick}
                        />
                        Outdoors
                    </p>
                    <p>
                        <input
                            type="radio"
                            value="Light"
                            name="basiclayer"
                            onClick={onRadioClick}
                        />
                        Light
                    </p>
                    <p>
                        <input
                            type="radio"
                            value="Dark"
                            name="basiclayer"
                            onClick={onRadioClick}
                        />
                        Dark
                    </p>
                    <p>
                        <input
                            type="radio"
                            value="Satellite"
                            name="basiclayer"
                            onClick={onRadioClick}
                        />
                        Satellite
                    </p>
                    <p>
                        <input
                            type="radio"
                            value="SatelliteStreets"
                            name="basiclayer"
                            onClick={onRadioClick}
                        />
                        Satellite Streets
                    </p>
                    <p>
                        <input
                            type="radio"
                            value="NavigationDay"
                            name="basiclayer"
                            onClick={onRadioClick}
                        />
                        Navigation Day
                    </p>
                    <p>
                        <input
                            type="radio"
                            value="NavigationNight"
                            name="basiclayer"
                            onClick={onRadioClick}
                        />
                        Navigation Night
                    </p>
                </div>
            </div>

            <div className="mapInteractive">
                <div className="latLonZoom">
                    Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
                </div>

                <div className="routeButtonsDiv">
                    <button onClick={onButtonLinestringClick}>
                        Linestring
                    </button>
                    <button onClick={onButtonLineClick}>Line</button>
                    <button onClick={onButtonPointClick}>Points</button>
                </div>
            </div>
        </div>
    );
}
