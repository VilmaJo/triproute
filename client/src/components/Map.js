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
    const [personalGeomFeatures, setPersonalGeomFeatures] = useState([]);
    const [tripCoordinates, setTripCoordinates] = useState();
    const [formData, setFormData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [visibility, setVisibility] = useState();
    const [routesVisibleMode, setRoutesVisibleMode] = useState(false);
    const [myRoutesVisibleMode, setMyRoutesVisibleMode] = useState(false);
    const [userId, setUserId] = useState();
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get("/api/geom").then((response) => {
            console.log("map api/geom ", response.data, response);
            return setGeomFeatures(response.data);
        });
        axios.get("/api/user/id").then((response) => {
            console.log("map /api/user/id ", response.data.user);
            return setUserId(response.data.user.id);
        });
    }, []);

    useEffect(() => {
        if (userId) {
            console.log("USERID TRUE", userId);
            axios.get(`/api/geom/${userId}`).then((request, response) => {
                console.log("map /api/geom/id THATS OK?????", request.data[0]);
                return setPersonalGeomFeatures(request.data);
            });
        }
    }, [userId]);

    useEffect(() => {
        if (map.current) return; // initialize map only once

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/light-v10",
            center: [lng, lat],
            zoom: zoom,
        });
        // map.current.on("move", () => {
        //     setLng(map.current.getCenter().lng.toFixed(zoom));
        //     setLat(map.current.getCenter().lat.toFixed(zoom));
        //     setZoom(map.current.getZoom().toFixed(2));
        // });
        // map.current.on("mousemove", function (e) {
        //     document.getElementById("info").innerHTML =
        //         JSON.stringify(e.point) +
        //         "<br />" +
        //         JSON.stringify(e.lngLat.toString());
        // });

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
    }, []);

    useEffect(() => {
        if (!basicLayer) {
            return;
        }
        map.current.setStyle(basicLayer);
    }, [basicLayer]);

    useEffect(() => {
        console.log("USE EFFECT EDIT MODE", editMode === true);
        let marker;
        let markers = [];
        if (editMode === true) {
            console.log("marker should be added", marker);
            map.current.on("click", (event) => {
                console.log("click", marker);
                marker = new mapboxgl.Marker()
                    .setLngLat(event.lngLat)
                    .addTo(map.current);
                markers.push(marker);
                console.log("marker inside", marker, markers);
            });

            return;
        }
        console.log("marker should be removed", markers);
        // console.log("noEdit");
        // marker.remove();
        // if (editMode === false) {
        //     console.log("marker should be removed", marker.remove());
        //     marker.remove();
        //     return;
        // }
        // console.log("what happens here?", marker);
    }, [editMode]);

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

    function renderRoutes(geoFeatures, visibleMode) {
        const colors = {
            car: "#e76f51",
            bike: "#2A9D8F",
            walk: "#E9C46A",
            boat: "#F4A261",
        };

        if (visibleMode === true) {
            geoFeatures.map((feature1) => {
                map.current.removeLayer(JSON.stringify(feature1.id));
                map.current.removeSource(feature1.tripname);
                // map.current.setLayoutProperty(
                //     JSON.stringify(feature1.id),
                //     "visibility",
                //     "none"
                // );
            });
            return;
        }

        geoFeatures.map((feature) => {
            if (map.current.getSource(feature.tripname)) {
                console.log("inside");
                map.current.addLayer({
                    id: JSON.stringify(feature.id),
                    type: "line",
                    source: feature.tripname,
                    layout: {
                        visibility: "visible",
                    },
                    paint: {
                        "line-color": colors[feature.triptype],
                        "line-width": 4,
                    },
                });
                return;
            }

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
                layout: {
                    visibility: "visible",
                },
                paint: {
                    "line-color": colors[feature.triptype],
                    "line-width": 4,
                },
            });
        });
    }

    useEffect(() => {
        console.log("VISIBILITY", visibility, geomFeatures);

        if (visibility) {
            console.log("VISIBILITY -1", visibility);
            // geomFeatures.map((feature) => {
            //     map.current.getLayer(feature.id);
            //     map.current.setLayoutProperty(
            //         JSON.stringify(feature.id),
            //         "visibility",
            //         "visible"
            //     );
            // });
        } else {
            console.log("VISIBILITY - 2", visibility);
            // geomFeatures.map((feature) => {
            //     map.current.getLayer(feature.id);
            //     map.current.setLayoutProperty(
            //         JSON.stringify(feature.id),
            //         "visibility",
            //         "none"
            //     );
            // });
        }
    }, [visibility]);

    // function changeVisibility() {
    //     if (visibleMode === true) {
    //         geoFeatures.map((feature1) => {
    //             // map.current.removeLayer(JSON.stringify(feature1.id));
    //             // map.current.removeSource(feature1.tripname);
    //             map.current.setLayoutProperty(
    //                 JSON.stringify(feature1.id),
    //                 "visibility",
    //                 "none"
    //             );
    //         });
    //         return;
    //     }
    // }

    function onButtonAllRoutesClick(event) {
        const html = event.target.innerHTML;
        if (html.includes("Hide")) {
            setRoutesVisibleMode(false);
            setVisibility(false);
            renderRoutes(geomFeatures, routesVisibleMode);
            return;
        }

        setRoutesVisibleMode(true);
        setVisibility(true);
        renderRoutes(geomFeatures, routesVisibleMode);
    }

    function onButtonPersonalRoutesClick(event) {
        const html = event.target.innerHTML;
        if (html.includes("Hide")) {
            setMyRoutesVisibleMode(false);
            setVisibility(false);
            renderRoutes(personalGeomFeatures, myRoutesVisibleMode);
            return;
        }

        setMyRoutesVisibleMode(true);
        setVisibility(true);
        renderRoutes(personalGeomFeatures, myRoutesVisibleMode);
    }

    function addRouteOnClick(event) {
        const html = event.target.innerHTML;

        if (html === "Cancel") {
            console.log("added Cancel");
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

                {/* <div className="latLonZoom">
                    Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
                </div> */}

                <div className="routeButtonsDiv">
                    <button onClick={onButtonAllRoutesClick}>
                        {routesVisibleMode ? "Hide" : "Show"} all Routes
                    </button>
                    <button onClick={onButtonPersonalRoutesClick}>
                        {myRoutesVisibleMode ? "Hide" : "Show "} my Routes
                    </button>
                </div>
                <div>
                    <p id="info"></p>
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
