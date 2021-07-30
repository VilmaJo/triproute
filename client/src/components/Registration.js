import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axios";

export default function Registration() {
    const [formData, setFormData] = useState({});
    const [errorMessage, setErrorMessage] = useState();

    function onFormSubmit(event) {
        event.preventDefault();
        axios
            .post("/api/registration", formData)
            .then(() => {
                window.location.replace("/map");
            })
            .catch((error) => {
                console.log("[registrations.js: error.response.data]", error);
                setErrorMessage(error.message);
            });
    }

    function onChange(event) {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }

    return (
        <div className="welcome">
            <h3>Please register</h3>
            <form method="POST" onSubmit={onFormSubmit} className="tripForm">
                <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="* First Name"
                    onChange={onChange}
                ></input>
                <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="* Last Name"
                    onChange={onChange}
                ></input>
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
                <button type="submit">Register</button>
            </form>
            <p>
                <Link to="/">Go to login</Link>
            </p>
            {errorMessage && <p>{errorMessage}</p>}
        </div>
    );
}
