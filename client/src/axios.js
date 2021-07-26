import axios from "axios";

const instance = axios.create({
    xsrfCookieName: "myToken",
    xsrfHeaderName: "csrf-token",
});

export default instance;
