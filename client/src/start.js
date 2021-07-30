import ReactDOM from "react-dom";
import axios from "./axios";
import App from "./components/App";
import { createStore, applyMiddleware } from "redux";
import reduxPromise from "redux-promise";
import Map from "./components/Map";

import { Provider } from "react-redux";

import Welcome from "./components/Welcome";

axios.get("/api/user/id").then((response) => {
    // const store = createStore(reducer applyMiddleware(reduxPromise));
    console.log("start.js", response.data);
    if (!response.data.user) {
        console.log("No user logged in");
        ReactDOM.render(
            // <Provider store={store}>
            <Welcome></Welcome>,
            // </Provider>,
            document.querySelector("body")
        );
        return;
    }
    console.log("User is logged in with the ID", response.data.user);
    ReactDOM.render(
        // <Provider store={store}>
        <App></App>,
        // </Provider>,
        document.querySelector("body")
    );
});
