import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../axios";
import Profile from "./Profile";

export default function Users() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get("/api/users").then((response) => {
            console.log("API response", response.data);
            return setUsers(response.data);
        });
    }, []);

    function renderUsers() {
        console.log("render users", users);
        return users.map((user) => {
            console.log("render users: user", user);
            return (
                <p key={user.id}>
                    <Profile
                        firstName={user.first_name}
                        lastName={user.last_name}
                        profileUrl={user.profile_url}
                        bio={user.bio}
                    ></Profile>
                </p>
            );
        });
    }
    return (
        <div>
            <ul>{renderUsers()}</ul>
        </div>
    );
}
