import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "../axios";

const token = require("./mapbox.json");
const styles = require("../mapdata/styles.json");
const mapBoxToken = token.token;
mapboxgl.accessToken = mapBoxToken;

export default function Map() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(9.0);
    const [lat, setLat] = useState(50.35);
    const [zoom, setZoom] = useState(4);
    const [basicLayer, setBasicLayer] = useState();
    const [geomFeatures, setGeomFeatures] = useState([]);
    const [tripCoordinates, setTripCoordinates] = useState();
    const [formData, setFormData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [routesVisibleMode, setRoutesVisibleMode] = useState(false);
    const [myRoutesVisibleMode, setMyRoutesVisibleMode] = useState(false);
    const [userId, setUserId] = useState();
    const [error, setError] = useState("");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        axios.get("/api/geom").then((response) => {
            setGeomFeatures(response.data);
        });
        axios.get("/api/user/id").then((response) => {
            setUserId(response.data.user.id);
        });
    }, []);

    useEffect(() => {
        if (ready && geomFeatures) {
            renderRoutes(geomFeatures);
        }
    }, [geomFeatures, ready]);

    useEffect(() => {
        if (map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/light-v10",
            center: [lng, lat],
            zoom: zoom,
        });
        map.current.on("load", () => setReady(true));

        let lngLatClicked = [];
        map.current.on("click", (event) => {
            lngLatClicked.push(event.lngLat);
            let coordPair = [];
            lngLatClicked.map((array) => {
                coordPair.push([array.lng, array.lat]);
            });
            setTripCoordinates(coordPair);
        });
    }, []);

    useEffect(() => {
        if (!basicLayer) {
            return;
        }
        map.current.setStyle(basicLayer);
    }, [basicLayer]);

    useEffect(() => {
        let marker;
        let markers = [];
        if (editMode === true) {
            map.current.on("click", (event) => {
                marker = new mapboxgl.Marker()
                    .setLngLat(event.lngLat)
                    .addTo(map.current);
                markers.push(marker);
            });
            return;
        }
    }, [editMode]);

    function onFormSubmit(event) {
        event.preventDefault();
        let tripName = formData.name;
        let tripType = formData.tripType;
        let coordinates = tripCoordinates;

        axios
            .post("/api/geom", { tripName, tripType, coordinates })
            .then(() => {
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

    function onCancelRoute() {
        document.getElementById("inputTripName").value = " ";
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

    function renderRoutes(features) {
        const colors = {
            car: "#e76f51",
            bike: "#2A9D8F",
            walk: "#E9C46A",
            boat: "#F4A261",
        };

        features.map((feature) => {
            map.current.addSource(JSON.stringify(feature.id), {
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
                source: JSON.stringify(feature.id),
                layout: {
                    visibility: "none",
                },
                paint: {
                    "line-color": colors[feature.triptype],
                    "line-width": 4,
                },
            });
        });
    }

    useEffect(() => {
        if (!geomFeatures.length || !ready) {
            return;
        }
        geomFeatures.map((feature) => {
            map.current.getLayer(JSON.stringify(feature.id));
            map.current.setLayoutProperty(
                JSON.stringify(feature.id),
                "visibility",
                routesVisibleMode ? "visible" : "none"
            );
        });
    }, [routesVisibleMode, geomFeatures, ready]);

    useEffect(() => {
        if (!geomFeatures.length || !ready || !userId) {
            return;
        }
        const features = geomFeatures.filter((x) => x.userid == userId);
        features.map((feature) => {
            map.current.getLayer(JSON.stringify(feature.id));
            map.current.setLayoutProperty(
                JSON.stringify(feature.id),
                "visibility",
                myRoutesVisibleMode ? "visible" : "none"
            );
        });
    }, [myRoutesVisibleMode, geomFeatures, ready, userId]);

    function onButtonAllRoutesClick() {
        if (routesVisibleMode) {
            setRoutesVisibleMode(false);
            return;
        }
        setRoutesVisibleMode(true);
    }

    function onButtonPersonalRoutesClick() {
        if (myRoutesVisibleMode) {
            setMyRoutesVisibleMode(false);
            return;
        }
        setMyRoutesVisibleMode(true);
    }

    function addRouteOnClick() {
        if (editMode) {
            setEditMode(false);
            return;
        }
        setEditMode(true);
    }

    function renderEditOptions() {
        return (
            <div className="mapInteractive">
                <div className="addRoutes">
                    <button onClick={addRouteOnClick}>
                        {editMode ? `Cancel` : `Start editing`}
                    </button>
                    <div className="FormAddRoutes">
                        <form
                            hidden={editMode ? false : true}
                            method="POST"
                            onSubmit={onFormSubmit}
                            className="registrationForm"
                        >
                            <input
                                type="text"
                                name="name"
                                id="inputTripName"
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
                            <button onClick={onCancelRoute}>Cancel</button>
                        </form>
                    </div>
                </div>

                <div className="routeButtonsDiv">
                    <button onClick={onButtonAllRoutesClick}>
                        {routesVisibleMode ? "Hide" : "Show"} all Routes
                    </button>
                    <button onClick={onButtonPersonalRoutesClick}>
                        {myRoutesVisibleMode ? "Hide" : "Show "} my Routes
                    </button>
                </div>
            </div>
        );
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

            {userId ? (
                renderEditOptions()
            ) : (
                <div className="mapInteractive">
                    <div className="addRoutes">
                        <p></p>
                    </div>
                    <div className="routeButtonsDiv">
                        <button onClick={onButtonAllRoutesClick}>
                            {routesVisibleMode ? "Hide" : "Show"} all Routes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
