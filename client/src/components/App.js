import { BrowserRouter, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../axios";
import Map from "./Map";

export default function App() {
    const [user, setUser] = useState({});

    useEffect(() => {
        axios.get("/api/user/id").then((response) => {
            setUser(response.data.user);
        });
    }, []);

    function onClickLogout() {
        axios.post("/api/logout", user);
        location.reload();
    }

    return (
        <BrowserRouter>
            <header className="appHeader">
                <Link to="/"> Home </Link>
                <Link to="/profile"> Profile </Link>
                <Link to="/map"> Map </Link>
                <Link to="/users"> User </Link>
                <button onClick={onClickLogout}>
                    Logout {user.first_name}
                </button>
            </header>
            <Route path="/map">
                <Map></Map>
            </Route>
            <main>
                <section className="app">
                    <section className="appContent">
                        <Route path="/profile"></Route>

                        <Route path="/users"></Route>
                    </section>
                </section>
            </main>
        </BrowserRouter>
    );
}
