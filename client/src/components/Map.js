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
    const [lng, setLng] = useState(9.0);
    const [lat, setLat] = useState(50.35);
    const [zoom, setZoom] = useState(4);
    const [basicLayer, setBasicLayer] = useState();
    const [geomFeatures, setGeomFeatures] = useState();
    const [tripCoordinates, setTripCoordinates] = useState();
    const [formData, setFormData] = useState({});
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get("/api/geom").then((response) => {
            console.log("map api/geom ", response.data);
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

        let lngLatClicked = [];
        map.current.on("click", (event) => {
            console.log("mapClick", event.lngLat);
            lngLatClicked.push(event.lngLat);
            let coordPair = [];
            lngLatClicked.map((array) => {
                coordPair.push([array.lng, array.lat]);
            });
            setTripCoordinates(coordPair);
        });

        map.current.on("mousemove", function (e) {
            document.getElementById("info").innerHTML =
                JSON.stringify(e.point) +
                "<br />" +
                JSON.stringify(e.lngLat.toString());
        });
    }, []);

    useEffect(() => {
        if (!basicLayer) {
            return;
        }
        map.current.setStyle(basicLayer);
    }, [basicLayer]);

    function onFormSubmit(event) {
        event.preventDefault();
        let tripName = formData.name;
        let tripType = formData.tripType;
        let coordinates = tripCoordinates;

        axios
            .post("/api/geom", { tripName, tripType, coordinates })
            .then(() => {
                console.log("It has been saved");
                window.location.replace("/map");
            })
            .catch((error) => {
                console.log("[registrations.js: error.response.data]", error);
                setError({ error: error.message });
            });
    }

    function onChange(event) {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }

    function onRadioClick(event) {
        let value = event.target.value;
        styles.map((style) => {
            if (style[value]) {
                setBasicLayer(style[value]);
                return;
            }
        });
    }

    function onButtonLinestringClick() {
        // MULTILINES MULTILINES MULTILINES MULTILINES MULTILINES
        const colors = {
            car: "#e76f51",
            bike: "#2A9D8F",
            walk: "#E9C46A",
            boat: "#F4A261",
        };

        geomFeatures.map((feature) => {
            map.current.addSource(feature.tripname, {
                type: "geojson",
                data: {
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: feature.coords,
                    },
                    properties: {
                        name: feature.tripname,
                        type: feature.triptype,
                        userId: feature.userId,
                    },
                },
            });
            map.current.addLayer({
                id: JSON.stringify(feature.id),
                type: "line",
                source: feature.tripname,
                paint: {
                    "line-color": colors[feature.triptype],
                    "line-width": 4,
                },
            });
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
            <div className="FormAddRoutes">
                <form
                    method="POST"
                    onSubmit={onFormSubmit}
                    className="registrationForm"
                >
                    <input
                        type="text"
                        name="name"
                        required
                        placeholder="Name of the trip"
                        onChange={onChange}
                    ></input>
                    <select
                        id="tripType"
                        name="tripType"
                        required
                        onChange={onChange}
                    >
                        <option disabled selected value>
                            Select the type of trip
                        </option>
                        <option value="car">Car</option>
                        <option value="bike">Bike</option>
                        <option value="walk">Foot</option>
                        <option value="boat">Boat</option>
                    </select>
                    <button type="submit">Save Route</button>
                </form>
            </div>

            <div className="mapInteractive">
                <div className="latLonZoom">
                    Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
                </div>

                <div className="routeButtonsDiv">
                    <button onClick={onButtonLinestringClick}>
                        Linestring
                    </button>
                    <button onClick={onButtonPointClick}>Points</button>
                </div>
                <div>
                    <p id="info"></p>
                </div>
            </div>
        </div>
    );
}
