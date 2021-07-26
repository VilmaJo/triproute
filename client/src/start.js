import ReactDOM from "react-dom";
import axios from "./axios";

import { Provider } from "react-redux";

import Welcome from "./components/Welcome";

axios.get("/api/user/id.json").then((response) => {
    console.log("User is logged in with the ID", response.data.userId);
    ReactDOM.render(
        // <Provider>
        <Welcome></Welcome>,

        // </Provider>,
        document.querySelector("main")
    );
});
