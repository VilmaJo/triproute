import ReactDOM from "react-dom";
import axios from "./axios";

import { Provider } from "react-redux";

import Welcome from "./components/Welcome";

axios.get("/").then((response) => {
    ReactDOM.render(
        // <Provider>
        <Welcome></Welcome>,

        // </Provider>,
        document.querySelector("main")
    );
});
