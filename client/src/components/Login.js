import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../axios";

export default function Login() {
    const [formData, setFormData] = useState({});
    const [errorMessage, setErrorMessage] = useState([]);

    function onChange(event) {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }

    function onFormSubmit(event) {
        event.preventDefault();
        console.log("onFormSubmit", formData);
        console.log("onFormSubmit error", errorMessage);
        axios
            .post("/api/login", formData)
            .then(() => {
                window.location.replace("/map");
            })
            .catch((error) => {
                console.log("[login.js: error.response.data]", error);
                setErrorMessage(error);
            });
    }

    return (
        <div className="welcome">
            <h3>Please login</h3>
            <form method="POST" onSubmit={onFormSubmit} className="tripForm">
                <input
                    type="email"
                    name="email"
                    required
                    placeholder="* Email"
                    onChange={onChange}
                ></input>
                <input
                    type="password"
                    name="password"
                    required
                    placeholder="* Password"
                    onChange={onChange}
                ></input>
                <button type="submit">Login</button>
            </form>
            <p>
                <Link to="/registration">Go to registration</Link>
            </p>
            {errorMessage && <p>{errorMessage}</p>}
        </div>
    );
}
