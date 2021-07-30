import { BrowserRouter, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../axios";
import Map from "./Map";
import Profile from "./Profile";

export default function App() {
    const [user, setUser] = useState({});
    const [showModal, setShowModal] = useState(false);
    // const [onExperienceChange, setOnExperienceChange] = useState(false);

    useEffect(() => {
        axios.get("/api/user/id").then((response) => {
            console.log("API response", response.data.user);
            return setUser(response.data.user);
        });
    }, []);

    function onClickLogout() {
        axios.post("/api/logout", user);
        location.reload();
    }

    function onBioChange(bio) {
        setUser({
            ...user,
            bio,
        });
        console.log("Now I am changing the Bio!!!!", user, bio);
    }
    // function onModalClose() {
    //     setShowModal(false);
    // }
    // function onPictureUpload(profilePicUrl) {
    //     setUser({
    //         ...user,
    //         profilePicUrl,
    //     });
    //     setShowModal(false);
    // }

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
                        <Profile
                            firstName={user.first_name}
                            lastName={user.last_name}
                            profileUrl={user.profile_url}
                            bio={user.bio}
                            onBioChange={onBioChange}
                        ></Profile>
                        <Route path="/users"></Route>
                    </section>
                </section>
            </main>
        </BrowserRouter>
    );
}
