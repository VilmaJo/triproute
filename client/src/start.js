import ReactDOM from "react-dom";
import axios from "./axios";
import App from "./components/App";
import Map from "./components/Map";

import { Provider } from "react-redux";

import Welcome from "./components/Welcome";

axios.get("/api/user/id").then((response) => {
    if (!response.data.user) {
        ReactDOM.render(
            // <Provider>
            <Welcome></Welcome>,

            // </Provider>,
            document.querySelector("body")
        );
        return;
    }
    console.log("User is logged in with the ID", response.data.user);
    ReactDOM.render(<App></App>, document.querySelector("body"));
});
